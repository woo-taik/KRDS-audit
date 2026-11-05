import { describe, expect, it } from 'vitest'
import { CSS_RULES } from './css-rules.js'
import { runCss } from './run-css.js'
import type { CssRule } from './types.js'

const TAILWIND = {
  file: 'node_modules/tailwindcss/theme.css',
  text: '@theme { --text-xs: 0.75rem; --text-sm: 0.875rem; --font-sans: ui-sans-serif; }',
}

const REDUCED =
  '@media (prefers-reduced-motion: reduce) { * { transition: none; animation: none; } }'

describe('runCss', () => {
  it('Tailwind 기본값 위에 대상 CSS를 겹쳐 글자 크기를 푼다', () => {
    const { resolveFontSize } = runCss(
      [{ file: 'src/app.css', text: '@theme { --text-xs: 0.8125rem; }' }],
      { rules: [], tailwindTheme: TAILWIND },
    )

    expect(resolveFontSize('text-xs')).toBe(13)
    expect(resolveFontSize('text-sm')).toBe(14)
  })

  it('Tailwind 테마가 없으면 대상 CSS 토큰만으로 푼다', () => {
    const { resolveFontSize } = runCss(
      [{ file: 'src/app.css', text: '@theme { --text-xs: 13px; }' }],
      {
        rules: [],
        tailwindTheme: null,
      },
    )

    expect(resolveFontSize('text-xs')).toBe(13)
    expect(resolveFontSize('text-sm')).toBeNull()
  })

  it('Tailwind 기본 테마의 --font-sans는 서체 선언으로 치지 않는다', () => {
    const { findings } = runCss([{ file: 'src/app.css', text: REDUCED }], {
      rules: CSS_RULES.filter((rule) => rule.id === 'krds/font-family-declared'),
      tailwindTheme: TAILWIND,
    })

    expect(findings.map((f) => [f.ruleId, f.file])).toEqual([
      ['krds/font-family-declared', 'src/app.css'],
    ])
  })

  it('전역 reduced-motion 규칙이 있는지 정적 엔진에 넘긴다', () => {
    const rules = CSS_RULES.filter((rule) => rule.id === 'krds/global-reduced-motion')

    expect(
      runCss([{ file: 'a.css', text: REDUCED }], { rules, tailwindTheme: null })
        .globalReducedMotion,
    ).toBe(true)
    expect(
      runCss([{ file: 'a.css', text: '' }], { rules, tailwindTheme: null }).globalReducedMotion,
    ).toBe(false)
  })

  it('위반은 파일·줄·칸·규칙 ID 순이다', () => {
    const spread: CssRule = {
      id: 'krds/theme-font-relative',
      check: () => [
        { ruleId: 'krds/theme-font-relative', file: 'b.css', line: 1, column: 1, snippet: 's' },
        { ruleId: 'krds/theme-font-relative', file: 'a.css', line: 2, column: 1, snippet: 's' },
        { ruleId: 'krds/theme-font-relative', file: 'a.css', line: 1, column: 4, snippet: 's' },
      ],
    }

    const { findings } = runCss(
      [
        { file: 'a.css', text: '' },
        { file: 'b.css', text: '' },
      ],
      { rules: [spread], tailwindTheme: null },
    )

    expect(findings.map((f) => [f.file, f.line, f.column])).toEqual([
      ['a.css', 1, 4],
      ['a.css', 2, 1],
      ['b.css', 1, 1],
    ])
  })
})
