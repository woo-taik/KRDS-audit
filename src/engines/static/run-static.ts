import { compareSourceFindings } from '../compare.js'
import type { SourceText } from '../types.js'
import { parseSource } from './parse-source.js'
import type { StaticConfig, StaticFinding, StaticRule } from './types.js'

export type RunStaticOptions = {
  rules: readonly StaticRule[]
  config: StaticConfig
  resolveFontSize: (utility: string) => number | null
  globalReducedMotion: boolean
}

/**
 * 파일마다 한 번 읽어 모든 규칙을 돌린다. 결과는 파일·줄·칸·규칙 ID 순으로 정렬하고,
 * 네 값이 같은 위반(한 상수를 여러 속성이 쓸 때)은 하나만 남긴다.
 */
export function runStatic(
  sources: readonly SourceText[],
  options: RunStaticOptions,
): StaticFinding[] {
  const findings: StaticFinding[] = []

  for (const { file, text } of sources) {
    const context = {
      file,
      sourceFile: parseSource(file, text),
      config: options.config,
      resolveFontSize: options.resolveFontSize,
      globalReducedMotion: options.globalReducedMotion,
    }

    for (const rule of options.rules) findings.push(...rule.check(context))
  }

  const seen = new Set<string>()

  return findings.sort(compareSourceFindings).filter((finding) => {
    const key = `${finding.ruleId}\0${finding.file}\0${finding.line}\0${finding.column}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
