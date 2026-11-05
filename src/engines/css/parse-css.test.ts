import { describe, expect, it } from 'vitest'
import { parseCss } from './parse-css.js'

describe('parseCss', () => {
  it('선언마다 시작 위치를 단다', () => {
    const root = parseCss('src/a.css', 'a {\n  color: red;\n}')
    const positions: unknown[] = []

    root.walkDecls((decl) => {
      positions.push(decl.source?.start)
    })

    expect(positions).toEqual([expect.objectContaining({ line: 2, column: 3 })])
  })

  it('Tailwind 지시어(@theme·@import·@layer)를 그대로 읽는다', () => {
    const root = parseCss('src/a.css', "@import 'tailwindcss';\n@theme { --text-xs: 1rem; }")
    const names: string[] = []

    root.walkAtRules((rule) => {
      names.push(rule.name)
    })

    expect(names).toEqual(['import', 'theme'])
  })

  it('문법 오류는 파일 이름을 단 채로 던진다', () => {
    expect(() => parseCss('src/broken.css', 'a {')).toThrow(/broken\.css/)
  })
})
