import type { Rule, Verdict } from '../catalog/types.js'
import { compareBaseline } from './baseline.js'
import { assignFingerprints } from './fingerprint.js'
import type { BuildReportInput, FingerprintedFinding, Report, RuleVerdict } from './types.js'

function verdictOf(
  rule: Rule,
  input: BuildReportInput,
  notApplicable: ReadonlySet<string>,
  hasFindings: boolean,
): Verdict {
  if (rule.engine === 'manual') return 'manual'
  if (notApplicable.has(rule.id)) return 'not-applicable'
  if (!input.ranEngines.has(rule.engine)) return 'not-run'
  if (hasFindings) return 'fail'
  return 'pass'
}

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
  const known = new Set(rules.map((rule) => rule.id))
  for (const finding of input.findings) {
    if (!known.has(finding.ruleId))
      throw new Error(`카탈로그에 없는 규칙의 위반이다: ${finding.ruleId}`)
  }

  const notApplicable = new Set<string>(input.notApplicable)
  const verdicts = new Map(
    rules.map((rule) => [
      rule.id,
      verdictOf(
        rule,
        input,
        notApplicable,
        input.findings.some((finding) => finding.ruleId === rule.id),
      ),
    ]),
  )

  const failing = assignFingerprints(
    input.findings.filter((finding) => verdicts.get(finding.ruleId) === 'fail'),
  )
  const baseline = input.baseline
    ? compareBaseline(
        failing.map((finding) => finding.fingerprint),
        input.baseline,
      )
    : null
  const added = new Set(baseline?.added)

  const findings: FingerprintedFinding[] = failing.map((finding) => ({
    ...finding,
    isNew: baseline ? added.has(finding.fingerprint) : null,
  }))

  const summary: Record<Verdict, number> = {
    pass: 0,
    fail: 0,
    'not-applicable': 0,
    'not-run': 0,
    manual: 0,
  }
  const ruleVerdicts: RuleVerdict[] = rules.map((rule) => {
    const verdict = verdicts.get(rule.id) ?? 'pass'
    summary[verdict] += 1

    return {
      ruleId: rule.id as RuleVerdict['ruleId'],
      verdict,
      findings: findings.filter((finding) => finding.ruleId === rule.id),
    }
  })

  return {
    tool: { name: 'krds-audit', version: input.toolVersion },
    target: input.target,
    summary,
    rules: ruleVerdicts,
    baseline,
  }
}
