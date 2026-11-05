import { describe, expect, it } from 'vitest'
import { RENDER_REPORT, RENDER_RULES } from '../test/render-report.js'
import { renderMarkdown } from './render-markdown.js'
import type { Report } from './types.js'

describe('renderMarkdown', () => {
  it('판정 표 → 기준선 → 판정별 절. 빈 절은 쓰지 않는다', () => {
    expect(renderMarkdown(RENDER_RULES, RENDER_REPORT)).toBe(
      [
        '# KRDS 검사 결과 — law-frontend',
        '',
        'krds-audit 0.1.0 · 규칙 6개',
        '',
        '| 판정 | 규칙 수 |',
        '| --- | ---: |',
        '| 미준수 | 2 |',
        '| 준수 | 1 |',
        '| 해당 없음 | 1 |',
        '| 검사 안 함 | 1 |',
        '| 수동 점검 | 1 |',
        '',
        '기준선: 새 위반 1건 · 해소 2건 — 해소된 식별자는 기준선에서 지운다: `dddddddddddddddd`, `eeeeeeeeeeeeeeee`',
        '',
        '## 미준수',
        '',
        '### krds/no-hash-href — 빈 링크를 두지 않는다',
        '',
        '필수 · 근거: [WCAG 2.4.4 Link Purpose](https://w/link)',
        '',
        '고칠 방법: 실제 주소를 준다',
        '',
        '- **새** `src/a.tsx:3:5` — `#`',
        '- `src/b.tsx:10:1` — `javascript:void(0)`',
        '',
        '### krds/gov-banner — 공식 배너',
        '',
        '권장 · 근거: [KRDS 원칙 7](https://k/p) · [KWCAG 2.4](https://k/w)',
        '',
        '고칠 방법: 배너를 숨기지 않는다',
        '',
        '- `/` @360px `header` — `banner`',
        '',
        '## 준수',
        '',
        '- krds/motion-reduce — 움직임',
        '',
        '## 해당 없음',
        '',
        '- krds/high-contrast-mode — 고대비',
        '',
        '## 검사 안 함',
        '',
        '- krds/contrast — 대비',
        '',
        '## 수동 점검',
        '',
        '- krds/manual-search-relevance — 관련성 확인',
        '',
      ].join('\n'),
    )
  })

  it('기준선 없이 모두 준수면 표와 준수 절뿐이다', () => {
    const report: Report = {
      tool: { name: 'krds-audit', version: '0.1.0' },
      target: 't',
      summary: { fail: 0, pass: 1, 'not-applicable': 0, 'not-run': 0, manual: 0 },
      rules: [{ ruleId: 'krds/no-hash-href', verdict: 'pass', findings: [] }],
      baseline: null,
    }

    expect(renderMarkdown(RENDER_RULES, report)).toBe(
      [
        '# KRDS 검사 결과 — t',
        '',
        'krds-audit 0.1.0 · 규칙 1개',
        '',
        '| 판정 | 규칙 수 |',
        '| --- | ---: |',
        '| 미준수 | 0 |',
        '| 준수 | 1 |',
        '| 해당 없음 | 0 |',
        '| 검사 안 함 | 0 |',
        '| 수동 점검 | 0 |',
        '',
        '## 준수',
        '',
        '- krds/no-hash-href — 빈 링크를 두지 않는다',
        '',
      ].join('\n'),
    )
  })

  it('해소된 것이 없으면 기준선 줄에 목록을 붙이지 않는다', () => {
    const output = renderMarkdown(RENDER_RULES, {
      ...RENDER_REPORT,
      baseline: { added: [], resolved: [] },
    })

    expect(output).toContain('\n기준선: 새 위반 0건 · 해소 0건\n')
  })
})
