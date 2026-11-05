import { describe, expect, it } from 'vitest'
import { RULES } from './rules.js'
import type { Rule } from './types.js'
import { validateCatalog } from './validate-catalog.js'

const rule = (overrides: Partial<Rule> = {}): Rule => ({
  id: 'krds/sample-rule',
  title: '표본 규칙',
  engine: 'static',
  level: 'required',
  basis: [{ doc: 'KRDS', ref: '표본', url: 'https://www.krds.go.kr/' }],
  detect: '표본 판정',
  fix: '표본 고침',
  ...overrides,
})

describe('validateCatalog', () => {
  it('실제 규칙 목록에는 문제가 없다', () => {
    expect(validateCatalog(RULES)).toEqual([])
  })

  it('온전한 규칙 하나는 문제가 없다', () => {
    expect(validateCatalog([rule()])).toEqual([])
  })

  it('같은 ID가 두 번 나오면 두 번째 자리에서 알린다', () => {
    expect(validateCatalog([rule(), rule({ title: '다른 제목' })])).toEqual([
      { ruleId: 'krds/sample-rule', problem: 'duplicate-id' },
    ])
  })

  it.each([
    'sample-rule',
    'krds/',
    'krds/Sample',
    'krds/sample_rule',
    'krds/-sample',
    'krds/sample-',
    'krds/sample--rule',
    'other/sample',
  ])('ID가 krds/케밥 꼴이 아니면 알린다: %s', (id) => {
    expect(validateCatalog([rule({ id })])).toEqual([{ ruleId: id, problem: 'malformed-id' }])
  })

  it('공백뿐인 제목은 빈 제목이다', () => {
    expect(validateCatalog([rule({ title: '  ' })])).toEqual([
      { ruleId: 'krds/sample-rule', problem: 'empty-title' },
    ])
  })

  it('근거가 없으면 알린다', () => {
    expect(validateCatalog([rule({ basis: [] })])).toEqual([
      { ruleId: 'krds/sample-rule', problem: 'no-basis' },
    ])
  })

  it('https가 아닌 근거 주소는 근거마다가 아니라 규칙당 한 번 알린다', () => {
    const insecure = { doc: 'KRDS' as const, ref: '표본', url: 'http://www.krds.go.kr/' }

    expect(validateCatalog([rule({ basis: [insecure, insecure] })])).toEqual([
      { ruleId: 'krds/sample-rule', problem: 'insecure-basis-url' },
    ])
  })

  it('판정 방법과 고칠 방법이 비면 알린다', () => {
    expect(validateCatalog([rule({ detect: '', fix: '\n' })])).toEqual([
      { ruleId: 'krds/sample-rule', problem: 'empty-detect' },
      { ruleId: 'krds/sample-rule', problem: 'empty-fix' },
    ])
  })

  it('한 규칙의 문제는 CatalogProblem 선언 순서로, 규칙은 목록 순서로 낸다', () => {
    const issues = validateCatalog([
      rule({ id: 'krds/b', fix: '', title: '' }),
      rule({ id: 'bad', basis: [] }),
      rule({ id: 'krds/b' }),
    ])

    expect(issues).toEqual([
      { ruleId: 'krds/b', problem: 'empty-title' },
      { ruleId: 'krds/b', problem: 'empty-fix' },
      { ruleId: 'bad', problem: 'malformed-id' },
      { ruleId: 'bad', problem: 'no-basis' },
      { ruleId: 'krds/b', problem: 'duplicate-id' },
    ])
  })
})
