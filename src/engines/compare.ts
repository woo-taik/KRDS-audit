import type { SourceFinding } from './types.js'

/** 로캘이 아니라 코드 단위로 견준다 — 실행 환경의 로캘에 순서가 흔들리지 않게. */
export function compareText(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/** 파일·줄·칸·규칙 ID 순. */
export function compareSourceFindings(a: SourceFinding, b: SourceFinding): number {
  return (
    compareText(a.file, b.file) ||
    a.line - b.line ||
    a.column - b.column ||
    compareText(a.ruleId, b.ruleId)
  )
}
