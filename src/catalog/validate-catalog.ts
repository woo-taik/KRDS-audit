import type { CatalogIssue, CatalogProblem, Rule } from './types.js'

const ID_PATTERN = /^krds\/[a-z0-9]+(-[a-z0-9]+)*$/

const blank = (text: string) => text.trim().length === 0

/**
 * 규칙 목록이 보고서의 정본이 될 자격을 갖췄는지 본다. 문제가 없으면 빈 배열이다.
 * 결과는 목록 순서대로, 한 규칙 안에서는 `CatalogProblem` 선언 순서대로 낸다.
 */
export function validateCatalog(rules: readonly Rule[]): CatalogIssue[] {
  const seen = new Set<string>()
  const issues: CatalogIssue[] = []

  for (const rule of rules) {
    const problems: CatalogProblem[] = []

    if (seen.has(rule.id)) problems.push('duplicate-id')
    seen.add(rule.id)
    if (!ID_PATTERN.test(rule.id)) problems.push('malformed-id')
    if (blank(rule.title)) problems.push('empty-title')
    if (rule.basis.length === 0) problems.push('no-basis')
    if (rule.basis.some((basis) => !basis.url.startsWith('https://'))) {
      problems.push('insecure-basis-url')
    }
    if (blank(rule.detect)) problems.push('empty-detect')
    if (blank(rule.fix)) problems.push('empty-fix')

    for (const problem of problems) issues.push({ ruleId: rule.id, problem })
  }

  return issues
}
