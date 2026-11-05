import { describe, expect, it } from 'vitest'
import { cssFinding } from './css-finding.js'
import { parseCss } from './parse-css.js'

describe('cssFinding', () => {
  it('노드가 있으면 그 시작 자리다', () => {
    const root = parseCss('src/a.css', '@theme {\n  --text-xs: 12px;\n}')
    let decl = null as Parameters<typeof cssFinding>[2]
    root.walkDecls((d) => {
      decl = d
    })

    expect(cssFinding('krds/theme-font-relative', 'src/a.css', decl, '--text-xs')).toEqual({
      ruleId: 'krds/theme-font-relative',
      file: 'src/a.css',
      line: 2,
      column: 3,
      snippet: '--text-xs',
    })
  })

  it('노드가 없으면 파일 1줄 1칸이다', () => {
    expect(cssFinding('krds/high-contrast-mode', 'src/a.css', null, 'forced-colors')).toMatchObject(
      {
        line: 1,
        column: 1,
      },
    )
  })
})
