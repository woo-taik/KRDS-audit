import { readFileSync } from 'node:fs'
import { join, matchesGlob } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RULES, type RuleId } from '../catalog/rules.js'
import { parseConfig } from '../config/parse-config.js'
import { CSS_RULES } from '../engines/css/css-rules.js'
import { runCss } from '../engines/css/run-css.js'
import { readTailwindTheme } from '../engines/css/tailwind-theme.js'
import { runStatic } from '../engines/static/run-static.js'
import { STATIC_RULES } from '../engines/static/static-rules.js'
import { buildReport } from '../report/build-report.js'
import type { AuditFinding } from '../report/types.js'
import { listFilesAt, prefixOf, readFileAt } from '../test/git-sources.js'

/**
 * law 프론트엔드 골든. 그 코드는 이 레포(GitHub)에 넣지 않으므로 로컬 경로가 있을 때만 돈다.
 *   KRDS_GOLDEN_LAW=C:\dev\law\frontend pnpm test
 * 기대값(`krds-golden.json`)과 설정은 law 작업 트리에서, 소스는 골든에 적힌 커밋에서 읽는다.
 */
const LAW = process.env.KRDS_GOLDEN_LAW

type Golden = {
  commit: string
  tailwindVersion: string
  verdicts: Partial<Record<RuleId, string>>
  /** snippet이 null이면 규칙·파일만 맞으면 된다(있어야 할 것이 없는 규칙). */
  mustFind: { ruleId: RuleId; file: string; snippet: string | null }[]
  /** 엔진을 다 만든 뒤 기록하는 전체 식별자 목록. 기록 전에는 null이다. */
  snapshot: string[] | null
}

const audit = (root: string, golden: Golden) => {
  const prefix = prefixOf(root)
  const at = (file: string) => readFileAt(root, golden.commit, `${prefix}${file}`)
  // 설정은 골든 곁(작업 트리)에서 읽는다. 커밋에 넣으면 골든이 자기 커밋 해시를 적어야 해서다.
  const config = parseConfig(readFileSync(join(root, 'krds.config.json'), 'utf8'))
  const files = listFilesAt(root, golden.commit)
    .filter((file) => file.startsWith(prefix))
    .map((file) => file.slice(prefix.length))

  const sources = files
    .filter((file) => config.sources.some((glob) => matchesGlob(file, glob)))
    .filter((file) => !config.exclude.some((glob) => matchesGlob(file, glob)))
    .map((file) => ({ file, text: at(file) }))

  const css = runCss(
    config.css.map((file) => ({ file, text: at(file) })),
    { rules: CSS_RULES, tailwindTheme: readTailwindTheme(root) },
  )
  const staticFindings = runStatic(sources, {
    rules: STATIC_RULES,
    config: config.static,
    resolveFontSize: css.resolveFontSize,
    globalReducedMotion: css.globalReducedMotion,
  })

  const findings: AuditFinding[] = [...css.findings, ...staticFindings].map((finding) => ({
    kind: 'source',
    ...finding,
  }))

  return buildReport(RULES, {
    target: config.name,
    toolVersion: 'golden',
    findings,
    ranEngines: new Set(['static', 'css']),
    notApplicable: new Set(config.notApplicable),
    baseline: null,
  })
}

describe.skipIf(!LAW)('law 골든', { timeout: 120_000 }, () => {
  const root = LAW ?? ''
  const golden = (): Golden => JSON.parse(readFileSync(join(root, 'krds-golden.json'), 'utf8'))

  it('설치된 Tailwind 판이 골든을 기록한 판과 같다', () => {
    const { version } = JSON.parse(
      readFileSync(join(root, 'node_modules', 'tailwindcss', 'package.json'), 'utf8'),
    )

    expect(version).toBe(golden().tailwindVersion)
  })

  it('규칙별 판정·반드시 찾을 위반·기록한 식별자가 그대로다', () => {
    const expected = golden()
    const report = audit(root, expected)

    const verdicts = Object.fromEntries(
      report.rules
        .filter((rule) => rule.ruleId in expected.verdicts)
        .map((rule) => [rule.ruleId, rule.verdict]),
    )
    expect(verdicts).toEqual(expected.verdicts)

    const found = report.rules.flatMap((rule) => rule.findings)
    const missing = expected.mustFind.filter(
      (want) =>
        !found.some(
          (got) =>
            got.kind === 'source' &&
            got.ruleId === want.ruleId &&
            got.file === want.file &&
            (want.snippet === null || got.snippet === want.snippet),
        ),
    )
    expect(missing).toEqual([])

    if (expected.snapshot) expect(found.map((f) => f.fingerprint).sort()).toEqual(expected.snapshot)
  })
})
