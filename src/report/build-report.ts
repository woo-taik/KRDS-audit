import type { Rule } from '../catalog/types.js'
import type { BuildReportInput, Report } from './types.js'

/**
 * 규칙마다 판정한다. 위에서부터 처음 맞는 것이 판정이다.
 * 1. 엔진이 `manual` → `manual`
 * 2. 설정이 해당 없다고 했다 → `not-applicable`
 * 3. 엔진을 돌리지 않았다 → `not-run`
 * 4. 위반이 있다 → `fail`
 * 5. 그 밖 → `pass`
 * 기준선은 `fail` 규칙의 위반만 견준다. 카탈로그에 없는 규칙의 위반은 던진다.
 */
export function buildReport(rules: readonly Rule[], input: BuildReportInput): Report {
  void rules
  void input
  throw new Error('not implemented')
}
