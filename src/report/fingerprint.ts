import type { AuditFinding } from './types.js'

/**
 * 위반마다 식별자를 단다. 결과는 `compareFindings` 순서다.
 *
 * 식별자는 sha256 앞 16자리(소문자 16진)이고, 재료를 `\0`으로 잇는다.
 * - 소스: `source`, 규칙 ID, 파일, snippet, 순번
 * - 화면: `page`, 규칙 ID, 경로, 폭, 셀렉터, snippet, 순번
 * 순번은 정렬한 뒤 앞의 재료가 모두 같은 위반 사이에서 0부터 센다 — 한 파일에 같은 `text-[11px]`가 둘이면 0과 1이다.
 */
export function assignFingerprints(
  findings: readonly AuditFinding[],
): (AuditFinding & { fingerprint: string })[] {
  void findings
  throw new Error('not implemented')
}
