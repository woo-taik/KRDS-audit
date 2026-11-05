import type { StaticConfig, StaticFinding, StaticRule } from './types.js'

export type SourceText = {
  /** 대상 레포 기준 상대 경로, `/` 구분. */
  file: string
  text: string
}

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
  void sources
  void options
  throw new Error('not implemented')
}
