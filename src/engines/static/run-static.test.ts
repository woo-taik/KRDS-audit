import { describe, expect, it } from 'vitest'
import { runStatic, type RunStaticOptions } from './run-static.js'
import type { StaticRule } from './types.js'

const options = (rules: StaticRule[]): RunStaticOptions => ({
  rules,
  config: { navigateFunctions: [], placeholderConstantPattern: /PLACEHOLDER/ },
  resolveFontSize: () => null,
  globalReducedMotion: false,
})

const at = (ruleId: StaticRule['id'], file: string, line: number, column: number) => ({
  ruleId,
  file,
  line,
  column,
  snippet: 's',
})

describe('runStatic', () => {
  it('파일·줄·칸·규칙 ID 순으로 정렬한다', () => {
    const b: StaticRule = {
      id: 'krds/no-hash-href',
      check: ({ file }) => [
        at('krds/no-hash-href', file, 2, 1),
        at('krds/no-hash-href', file, 1, 5),
      ],
    }
    const a: StaticRule = {
      id: 'krds/min-font-size',
      check: ({ file }) => [at('krds/min-font-size', file, 1, 5)],
    }

    const result = runStatic(
      [
        { file: 'src/z.tsx', text: '' },
        { file: 'src/a.tsx', text: '' },
      ],
      options([b, a]),
    )

    expect(result.map((f) => [f.file, f.line, f.column, f.ruleId])).toEqual([
      ['src/a.tsx', 1, 5, 'krds/min-font-size'],
      ['src/a.tsx', 1, 5, 'krds/no-hash-href'],
      ['src/a.tsx', 2, 1, 'krds/no-hash-href'],
      ['src/z.tsx', 1, 5, 'krds/min-font-size'],
      ['src/z.tsx', 1, 5, 'krds/no-hash-href'],
      ['src/z.tsx', 2, 1, 'krds/no-hash-href'],
    ])
  })

  it('규칙·파일·줄·칸이 같은 위반은 하나만 남긴다', () => {
    const twice: StaticRule = {
      id: 'krds/no-hash-href',
      check: ({ file }) => [
        at('krds/no-hash-href', file, 3, 3),
        at('krds/no-hash-href', file, 3, 3),
      ],
    }

    expect(runStatic([{ file: 'src/a.tsx', text: '' }], options([twice]))).toHaveLength(1)
  })

  it('규칙에 대상 설정과 CSS 엔진 결과를 그대로 넘긴다', () => {
    const seen: unknown[] = []
    const spy: StaticRule = {
      id: 'krds/motion-reduce',
      check: (context) => {
        seen.push([context.file, context.globalReducedMotion, context.resolveFontSize('text-sm')])
        return []
      },
    }

    runStatic([{ file: 'src/a.tsx', text: 'const a = 1' }], {
      ...options([spy]),
      resolveFontSize: (utility) => (utility === 'text-sm' ? 15 : null),
      globalReducedMotion: true,
    })

    expect(seen).toEqual([['src/a.tsx', true, 15]])
  })
})
