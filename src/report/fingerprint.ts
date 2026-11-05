import { createHash } from 'node:crypto'
import { compareFindings } from './sort-findings.js'
import type { AuditFinding } from './types.js'

/** 순번을 뺀 식별자 재료. */
function material(finding: AuditFinding): string[] {
  if (finding.kind === 'source') {
    return ['source', finding.ruleId, finding.file, finding.snippet]
  }

  return [
    'page',
    finding.ruleId,
    finding.route,
    String(finding.viewport),
    finding.selector,
    finding.snippet,
  ]
}

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
  const occurrences = new Map<string, number>()

  return [...findings].sort(compareFindings).map((finding) => {
    const key = material(finding).join('\0')
    const occurrence = occurrences.get(key) ?? 0
    occurrences.set(key, occurrence + 1)

    const fingerprint = createHash('sha256')
      .update(`${key}\0${occurrence}`)
      .digest('hex')
      .slice(0, 16)

    return { ...finding, fingerprint }
  })
}
