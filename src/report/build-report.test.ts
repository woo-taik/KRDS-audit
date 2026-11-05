import { describe, expect, it } from 'vitest'
import type { RuleId } from '../catalog/rules.js'
import type { Engine, Rule } from '../catalog/types.js'
import { buildReport } from './build-report.js'
import { assignFingerprints } from './fingerprint.js'
import type { AuditFinding, BuildReportInput } from './types.js'

const rule = (id: RuleId, engine: Engine): Rule => ({
  id,
  title: id,
  engine,
  level: 'required',
  basis: [{ doc: 'KRDS', ref: 'r', url: 'https://k/' }],
  detect: 'd',
  fix: 'f',
})

const RULES = [
  rule('krds/no-hash-href', 'static'),
  rule('krds/min-font-size', 'static'),
  rule('krds/high-contrast-mode', 'css'),
  rule('krds/gov-banner', 'runtime'),
  rule('krds/manual-search-relevance', 'manual'),
]

const hashHref = (line: number): AuditFinding => ({
  kind: 'source',
  ruleId: 'krds/no-hash-href',
  file: 'src/a.tsx',
  line,
  column: 1,
  snippet: `#${line}`,
})

const input = (overrides: Partial<BuildReportInput> = {}): BuildReportInput => ({
  target: 'sample',
  toolVersion: '0.1.0',
  findings: [],
  ranEngines: new Set(['static', 'css']),
  notApplicable: new Set(),
  baseline: null,
  ...overrides,
})

const verdicts = (report: ReturnType<typeof buildReport>) =>
  report.rules.map((r) => [r.ruleId, r.verdict])

describe('buildReport', () => {
  it('판정 순서: 수동 → 해당 없음 → 검사 안 함 → 미준수 → 준수', () => {
    const report = buildReport(
      RULES,
      input({
        findings: [hashHref(1), { ...hashHref(2), ruleId: 'krds/high-contrast-mode' }],
        notApplicable: new Set(['krds/high-contrast-mode', 'krds/manual-search-relevance']),
      }),
    )

    expect(verdicts(report)).toEqual([
      ['krds/no-hash-href', 'fail'],
      ['krds/min-font-size', 'pass'],
      ['krds/high-contrast-mode', 'not-applicable'],
      ['krds/gov-banner', 'not-run'],
      ['krds/manual-search-relevance', 'manual'],
    ])
    expect(report.summary).toEqual({
      pass: 1,
      fail: 1,
      'not-applicable': 1,
      'not-run': 1,
      manual: 1,
    })
  })

  it('미준수가 아닌 규칙은 위반을 들지 않는다', () => {
    const report = buildReport(
      RULES,
      input({
        findings: [{ ...hashHref(1), ruleId: 'krds/high-contrast-mode' }],
        notApplicable: new Set(['krds/high-contrast-mode']),
      }),
    )

    expect(report.rules.every((r) => r.verdict === 'fail' || r.findings.length === 0)).toBe(true)
  })

  it('위반을 정렬하고 식별자를 단다. 기준선이 없으면 isNew는 null이다', () => {
    const report = buildReport(RULES, input({ findings: [hashHref(9), hashHref(2)] }))
    const [fail] = report.rules

    expect(fail?.findings).toEqual(
      assignFingerprints([hashHref(2), hashHref(9)]).map((f) => ({ ...f, isNew: null })),
    )
    expect(report.baseline).toBeNull()
  })

  it('기준선과 견줘 새 위반을 표시하고 해소된 것을 알린다', () => {
    const [known] = assignFingerprints([hashHref(2)])
    const report = buildReport(
      RULES,
      input({
        findings: [hashHref(2), hashHref(9)],
        baseline: { version: 1, fingerprints: [known?.fingerprint ?? '', 'ffffffffffffffff'] },
      }),
    )
    const findings = report.rules[0]?.findings ?? []

    expect(findings.map((f) => [f.kind === 'source' && f.line, f.isNew])).toEqual([
      [2, false],
      [9, true],
    ])
    expect(report.baseline).toEqual({
      added: [findings[1]?.fingerprint],
      resolved: ['ffffffffffffffff'],
    })
  })

  it('카탈로그에 없는 규칙의 위반은 던진다', () => {
    expect(() =>
      buildReport([rule('krds/min-font-size', 'static')], input({ findings: [hashHref(1)] })),
    ).toThrow(/krds\/no-hash-href/)
  })

  it('도구·대상을 머리에 싣는다', () => {
    expect(buildReport(RULES, input())).toMatchObject({
      tool: { name: 'krds-audit', version: '0.1.0' },
      target: 'sample',
    })
  })
})
