import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { RULES } from '../catalog/rules.js'
import type { Engine } from '../catalog/types.js'
import { CONFIG_FILE, ConfigError, parseConfig } from '../config/parse-config.js'
import type { KrdsConfig } from '../config/types.js'
import { CSS_RULES } from '../engines/css/css-rules.js'
import { runCss } from '../engines/css/run-css.js'
import { readTailwindTheme } from '../engines/css/tailwind-theme.js'
import { compareText } from '../engines/compare.js'
import { runRuntime } from '../engines/runtime/run-runtime.js'
import { RUNTIME_RULES } from '../engines/runtime/runtime-rules.js'
import { runStatic } from '../engines/static/run-static.js'
import { STATIC_RULES } from '../engines/static/static-rules.js'
import type { PageFinding } from '../engines/types.js'
import { parseBaseline, serializeBaseline } from '../report/baseline.js'
import { buildReport } from '../report/build-report.js'
import { renderJson } from '../report/render-json.js'
import { renderMarkdown } from '../report/render-markdown.js'
import { renderSarif } from '../report/render-sarif.js'
import type { AuditFinding, Baseline, Report } from '../report/types.js'
import { collectSources } from './collect-sources.js'
import type { CheckOptions, CheckResult, OutputFile, ReportFormat } from './types.js'

const readText = (path: string) => readFile(path, 'utf8').catch(() => null)

async function loadConfig(target: string): Promise<KrdsConfig> {
  const text = await readText(join(target, CONFIG_FILE))
  if (text === null) throw new ConfigError('', `${target}에 없다`)
  return parseConfig(text)
}

async function loadBaseline(path: string): Promise<Baseline | null> {
  const text = await readText(path)
  return text === null ? null : parseBaseline(text)
}

async function runPages(url: string, config: KrdsConfig): Promise<PageFinding[]> {
  if (!config.runtime) return []

  const notApplicable = new Set<string>(config.notApplicable)
  const browser = await chromium.launch()
  try {
    return await runRuntime({
      baseUrl: url,
      config: config.runtime,
      // 해당 없다고 한 규칙은 돌리지 않는다 — 시나리오가 비어 있는 규칙도 여기서 빠진다.
      rules: RUNTIME_RULES.filter((rule) => !notApplicable.has(rule.id)),
      browser,
    })
  } finally {
    await browser.close()
  }
}

function render(format: ReportFormat, report: Report): string {
  switch (format) {
    case 'md':
      return renderMarkdown(RULES, report)
    case 'json':
      return renderJson(report)
    case 'sarif':
      return renderSarif(RULES, report)
  }
}

function exitCodeOf(report: Report, updateBaseline: boolean): 0 | 1 {
  if (updateBaseline) return 0
  if (report.baseline) return report.baseline.added.length > 0 ? 1 : 0
  return report.summary.fail > 0 ? 1 : 0
}

/**
 * 한 번의 검사. 파일을 쓰지 않고 쓸 것을 돌려준다(`main`이 쓴다).
 *
 * 1. `<target>/krds.config.json`을 읽는다(없으면 ConfigError, 틀린 ConfigError는 그대로 던진다).
 * 2. CSS 엔진 → 정적 엔진. `url`이 있고 설정에 `runtime`이 있으면 chromium을 띄워 화면 엔진도 돌린다.
 * 3. 기준선 파일이 있으면 읽어 견준다. `updateBaseline`이면 견주지 않고 지금 식별자로 기준선을 낸다.
 * 4. 보고서를 형식마다 `<outDir>/krds-report.<형식>`으로 낸다.
 *
 * 종료 코드: `updateBaseline`이면 0. 기준선이 있으면 새 위반이 있을 때 1, 없으면 미준수 규칙이 있을 때 1.
 */
export async function runCheck(options: CheckOptions, toolVersion: string): Promise<CheckResult> {
  const { target } = options
  const config = await loadConfig(target)

  const cssSources = await Promise.all(
    config.css.map(async (file, index) => {
      const text = await readText(join(target, ...file.split('/')))
      if (text === null) throw new ConfigError(`css[${index}]`, `파일이 없다: ${file}`)
      return { file, text }
    }),
  )
  const css = runCss(cssSources, { rules: CSS_RULES, tailwindTheme: readTailwindTheme(target) })
  const staticFindings = runStatic(await collectSources(target, config), {
    rules: STATIC_RULES,
    config: config.static,
    resolveFontSize: css.resolveFontSize,
    globalReducedMotion: css.globalReducedMotion,
  })

  const ranEngines = new Set<Engine>(['static', 'css'])
  const pageFindings = options.url && config.runtime ? await runPages(options.url, config) : []
  if (options.url && config.runtime) ranEngines.add('runtime')

  const findings: AuditFinding[] = [
    ...css.findings.map((finding) => ({ kind: 'source' as const, ...finding })),
    ...staticFindings.map((finding) => ({ kind: 'source' as const, ...finding })),
    ...pageFindings.map((finding) => ({ kind: 'page' as const, ...finding })),
  ]

  const baselinePath = join(target, ...config.baseline.split('/'))
  const report = buildReport(RULES, {
    target: config.name,
    toolVersion,
    findings,
    ranEngines,
    notApplicable: new Set(config.notApplicable),
    baseline: options.updateBaseline ? null : await loadBaseline(baselinePath),
  })

  const outputs: OutputFile[] = options.formats.map((format) => ({
    path: join(options.outDir, `krds-report.${format}`),
    text: render(format, report),
  }))
  if (options.updateBaseline) {
    const fingerprints = report.rules.flatMap((rule) => rule.findings).map((f) => f.fingerprint)
    outputs.push({ path: baselinePath, text: serializeBaseline(fingerprints) })
  }

  return {
    report,
    outputs: outputs.sort((a, b) => compareText(a.path, b.path)),
    exitCode: exitCodeOf(report, options.updateBaseline),
  }
}
