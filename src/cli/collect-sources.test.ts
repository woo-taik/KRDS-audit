import { afterEach, describe, expect, it } from 'vitest'
import type { KrdsConfig } from '../config/types.js'
import { makeTarget, type TempTarget } from '../test/temp-target.js'
import { collectSources } from './collect-sources.js'

const config = (sources: string[], exclude: string[] = []): KrdsConfig => ({
  name: 't',
  sources,
  exclude,
  css: [],
  static: { navigateFunctions: ['navigate'], placeholderConstantPattern: /PLACEHOLDER/ },
  notApplicable: [],
  baseline: 'krds-baseline.json',
  runtime: null,
})

let target: TempTarget | null = null

afterEach(() => {
  target?.remove()
  target = null
})

describe('collectSources', () => {
  it('glob에 맞는 파일을 / 구분 상대 경로와 내용으로 코드 포인트 순에 낸다', async () => {
    target = makeTarget({
      'src/b/x.tsx': 'x',
      'src/B.tsx': 'B',
      'src/a.ts': 'a',
      'src/a.css': 'css',
    })

    expect(await collectSources(target.root, config(['src/**/*.tsx', 'src/**/*.ts']))).toEqual([
      { file: 'src/B.tsx', text: 'B' },
      { file: 'src/a.ts', text: 'a' },
      { file: 'src/b/x.tsx', text: 'x' },
    ])
  })

  it('exclude에 맞으면 뺀다', async () => {
    target = makeTarget({
      'src/a.tsx': 'a',
      'src/a.test.tsx': 't',
      'src/mocks/m.tsx': 'm',
    })

    const files = await collectSources(
      target.root,
      config(['src/**/*.tsx'], ['src/**/*.test.tsx', 'src/mocks/**']),
    )

    expect(files.map((f) => f.file)).toEqual(['src/a.tsx'])
  })

  it('node_modules는 glob이 맞아도 뺀다', async () => {
    target = makeTarget({ 'node_modules/pkg/a.tsx': 'p', 'a.tsx': 'a' })

    expect((await collectSources(target.root, config(['**/*.tsx']))).map((f) => f.file)).toEqual([
      'a.tsx',
    ])
  })
})
