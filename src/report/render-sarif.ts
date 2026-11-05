import type { Rule } from '../catalog/types.js'
import type { Report } from './types.js'

/**
 * SARIF 2.1.0 — IDE·코드 스캐닝이 읽는다. 결과는 `fail` 규칙의 위반만 싣는다.
 * 수준은 필수 → error, 권장 → warning, 우수 → note. 식별자는 `partialFingerprints.krds`다.
 */
export function renderSarif(rules: readonly Rule[], report: Report): string {
  void rules
  void report
  throw new Error('not implemented')
}
