import type { CatalogIssue, Rule } from './types.js'

/**
 * 규칙 목록이 보고서의 정본이 될 자격을 갖췄는지 본다. 문제가 없으면 빈 배열이다.
 * 결과는 목록 순서대로, 한 규칙 안에서는 `CatalogProblem` 선언 순서대로 낸다.
 */
export function validateCatalog(rules: readonly Rule[]): CatalogIssue[] {
  void rules
  throw new Error('not implemented')
}
