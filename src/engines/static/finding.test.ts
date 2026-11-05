import { describe, expect, it } from 'vitest'
import { findingAt } from './finding.js'
import { parseSource } from './parse-source.js'
import type { StaticContext } from './types.js'

const context = (text: string): StaticContext => ({
  file: 'src/a.tsx',
  sourceFile: parseSource('src/a.tsx', text),
  config: { navigateFunctions: [], placeholderConstantPattern: /PLACEHOLDER/ },
  resolveFontSize: () => null,
  globalReducedMotion: false,
})

describe('findingAt', () => {
  it('위치를 1부터 세는 줄·칸으로 바꾼다', () => {
    const text = 'const a = 1\n  const b = 2'

    expect(findingAt(context(text), 'krds/no-hash-href', text.indexOf('b'), 'b')).toEqual({
      ruleId: 'krds/no-hash-href',
      file: 'src/a.tsx',
      line: 2,
      column: 9,
      snippet: 'b',
    })
  })

  it('파일 첫 글자는 1줄 1칸이다', () => {
    expect(findingAt(context('x'), 'krds/no-hash-href', 0, 'x')).toMatchObject({
      line: 1,
      column: 1,
    })
  })
})
