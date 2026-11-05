import { compareSourceFindings, compareText } from '../engines/compare.js'
import type { AuditFinding } from './types.js'

/**
 * 보고서·식별자가 기대는 하나의 순서. 소스가 화면보다 앞이고,
 * 소스는 파일·줄·칸·규칙 ID, 화면은 경로·폭(작은 것부터)·셀렉터·규칙 ID 순이다. 문자열은 코드 포인트로 견준다.
 */
export function compareFindings(a: AuditFinding, b: AuditFinding): number {
  if (a.kind === 'source' && b.kind === 'source') return compareSourceFindings(a, b)
  if (a.kind === 'source') return -1
  if (b.kind === 'source') return 1

  return (
    compareText(a.route, b.route) ||
    a.viewport - b.viewport ||
    compareText(a.selector, b.selector) ||
    compareText(a.ruleId, b.ruleId)
  )
}
