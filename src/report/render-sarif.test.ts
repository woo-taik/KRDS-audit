import { describe, expect, it } from 'vitest'
import { RENDER_REPORT, RENDER_RULES } from '../test/render-report.js'
import { renderSarif } from './render-sarif.js'

const sarif = (report = RENDER_REPORT) => JSON.parse(renderSarif(RENDER_RULES, report))

describe('renderSarif', () => {
  it('SARIF 2.1.0 머리와 도구 정보', () => {
    const log = sarif()

    expect(log.version).toBe('2.1.0')
    expect(log.$schema).toBe('https://json.schemastore.org/sarif-2.1.0.json')
    expect(log.runs).toHaveLength(1)
    expect(log.runs[0].tool.driver).toMatchObject({ name: 'krds-audit', version: '0.1.0' })
  })

  it('규칙은 카탈로그 전부를 순서대로 싣는다 — 도움말 주소는 첫 근거다', () => {
    const rules = sarif().runs[0].tool.driver.rules

    expect(rules.map((r: { id: string }) => r.id)).toEqual(RENDER_RULES.map((r) => r.id))
    expect(rules[1]).toEqual({
      id: 'krds/gov-banner',
      shortDescription: { text: '공식 배너' },
      helpUri: 'https://k/p',
      properties: { level: 'recommended' },
    })
  })

  it('결과는 미준수 규칙의 위반만, 보고서 순서대로다', () => {
    const results = sarif().runs[0].results

    expect(results.map((r: { ruleId: string }) => r.ruleId)).toEqual([
      'krds/no-hash-href',
      'krds/no-hash-href',
      'krds/gov-banner',
    ])
  })

  it('소스 위반은 물리 위치, 수준·메시지·식별자·기준선 상태를 단다', () => {
    expect(sarif().runs[0].results[0]).toEqual({
      ruleId: 'krds/no-hash-href',
      level: 'error',
      message: { text: '빈 링크를 두지 않는다: #' },
      partialFingerprints: { krds: 'aaaaaaaaaaaaaaaa' },
      baselineState: 'new',
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: 'src/a.tsx' },
            region: { startLine: 3, startColumn: 5 },
          },
        },
      ],
    })
  })

  it('화면 위반은 논리 위치(경로 @폭 셀렉터)다. 권장은 warning이다', () => {
    expect(sarif().runs[0].results[2]).toMatchObject({
      level: 'warning',
      baselineState: 'unchanged',
      locations: [{ logicalLocations: [{ fullyQualifiedName: '/ @360px header' }] }],
    })
  })

  it('기준선 없이 돌렸으면 baselineState를 쓰지 않는다', () => {
    const report = {
      ...RENDER_REPORT,
      baseline: null,
      rules: RENDER_REPORT.rules.map((r) => ({
        ...r,
        findings: r.findings.map((f) => ({ ...f, isNew: null })),
      })),
    }

    for (const result of sarif(report).runs[0].results)
      expect(result).not.toHaveProperty('baselineState')
  })
})
