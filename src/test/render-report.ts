import type { RuleId } from '../catalog/rules.js'
import type { Engine, Level, Rule } from '../catalog/types.js'
import type { Report } from '../report/types.js'

// 렌더러 테스트가 함께 쓰는 손으로 짠 보고서. buildReport를 거치지 않아 렌더러만 따로 검사한다.

const rule = (
  id: RuleId,
  title: string,
  engine: Engine,
  level: Level,
  fix: string,
  basis: Rule['basis'],
): Rule => ({
  id,
  title,
  engine,
  level,
  basis,
  detect: 'd',
  fix,
})

export const RENDER_RULES: Rule[] = [
  rule('krds/no-hash-href', '빈 링크를 두지 않는다', 'static', 'required', '실제 주소를 준다', [
    { doc: 'WCAG', ref: '2.4.4 Link Purpose', url: 'https://w/link' },
  ]),
  rule('krds/gov-banner', '공식 배너', 'runtime', 'recommended', '배너를 숨기지 않는다', [
    { doc: 'KRDS', ref: '원칙 7', url: 'https://k/p' },
    { doc: 'KWCAG', ref: '2.4', url: 'https://k/w' },
  ]),
  rule('krds/motion-reduce', '움직임', 'static', 'recommended', 'f', [
    { doc: 'WCAG', ref: '2.3.3', url: 'https://w/m' },
  ]),
  rule('krds/high-contrast-mode', '고대비', 'css', 'required', 'f', [
    { doc: 'KRDS', ref: '포용', url: 'https://k/i' },
  ]),
  rule('krds/contrast', '대비', 'runtime', 'excellent', 'f', [
    { doc: 'WCAG', ref: '1.4.3', url: 'https://w/c' },
  ]),
  rule('krds/manual-search-relevance', '관련성 확인', 'manual', 'required', 'f', [
    { doc: 'KRDS', ref: '검색', url: 'https://k/s' },
  ]),
]

export const RENDER_REPORT: Report = {
  tool: { name: 'krds-audit', version: '0.1.0' },
  target: 'law-frontend',
  summary: { fail: 2, pass: 1, 'not-applicable': 1, 'not-run': 1, manual: 1 },
  rules: [
    {
      ruleId: 'krds/no-hash-href',
      verdict: 'fail',
      findings: [
        {
          kind: 'source',
          ruleId: 'krds/no-hash-href',
          file: 'src/a.tsx',
          line: 3,
          column: 5,
          snippet: '#',
          fingerprint: 'aaaaaaaaaaaaaaaa',
          isNew: true,
        },
        {
          kind: 'source',
          ruleId: 'krds/no-hash-href',
          file: 'src/b.tsx',
          line: 10,
          column: 1,
          snippet: 'javascript:void(0)',
          fingerprint: 'bbbbbbbbbbbbbbbb',
          isNew: false,
        },
      ],
    },
    {
      ruleId: 'krds/gov-banner',
      verdict: 'fail',
      findings: [
        {
          kind: 'page',
          ruleId: 'krds/gov-banner',
          route: '/',
          viewport: 360,
          selector: 'header',
          snippet: 'banner',
          fingerprint: 'cccccccccccccccc',
          isNew: false,
        },
      ],
    },
    { ruleId: 'krds/motion-reduce', verdict: 'pass', findings: [] },
    { ruleId: 'krds/high-contrast-mode', verdict: 'not-applicable', findings: [] },
    { ruleId: 'krds/contrast', verdict: 'not-run', findings: [] },
    { ruleId: 'krds/manual-search-relevance', verdict: 'manual', findings: [] },
  ],
  baseline: { added: ['aaaaaaaaaaaaaaaa'], resolved: ['dddddddddddddddd', 'eeeeeeeeeeeeeeee'] },
}
