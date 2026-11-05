import { describe, expect, it } from 'vitest'
import { parseCss } from './parse-css.js'
import { collectThemeTokens } from './theme-tokens.js'

const tokens = (...texts: string[]) =>
  Object.fromEntries(collectThemeTokens(texts.map((text, i) => parseCss(`${i}.css`, text))))

describe('collectThemeTokens', () => {
  it('@theme의 --* 선언만 모은다', () => {
    expect(
      tokens('@theme { --text-xs: 0.75rem; color: red; }\n:root { --text-sm: 12px; }'),
    ).toEqual({ '--text-xs': '0.75rem' })
  })

  it('inline·static 변형과 중첩된 @theme도 읽는다', () => {
    expect(
      tokens(
        '@theme inline { --a: 1; }\n@theme static { --b: 2; }\n@layer x { @theme { --c: 3; } }',
      ),
    ).toEqual({ '--a': '1', '--b': '2', '--c': '3' })
  })

  it('뒤에 선언한 값이 앞(앞 파일 포함)을 덮는다', () => {
    expect(
      tokens('@theme { --text-xs: 0.75rem; --text-sm: 0.875rem; }', '@theme { --text-xs: 13px; }'),
    ).toEqual({ '--text-xs': '13px', '--text-sm': '0.875rem' })
  })

  it('--<ns>-*: initial은 그 자리에서 이름공간을 비운다 — 뒤의 선언은 남는다', () => {
    expect(
      tokens(
        '@theme { --text-xs: 0.75rem; --text-xs--line-height: 1; --color-red: red; }',
        '@theme { --text-*: initial; --text-body: 1rem; }',
      ),
    ).toEqual({ '--color-red': 'red', '--text-body': '1rem' })
  })

  it('--*: initial은 전부를 비운다', () => {
    expect(tokens('@theme { --a: 1; }', '@theme { --*: initial; --b: 2; }')).toEqual({
      '--b': '2',
    })
  })

  it('값이 initial이면 그 토큰만 지운다', () => {
    expect(
      tokens('@theme { --font-sans: x; --font-mono: y; }', '@theme { --font-sans: initial; }'),
    ).toEqual({
      '--font-mono': 'y',
    })
  })
})
