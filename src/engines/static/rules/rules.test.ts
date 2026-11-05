import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { RULES } from '../../../catalog/rules.js'
import { parseSource } from '../parse-source.js'
import { STATIC_RULES } from '../static-rules.js'
import type { StaticContext, StaticRule } from '../types.js'

const FIXTURES = fileURLToPath(new URL('../../../../fixtures/static/', import.meta.url))

const FONT_SIZES: Record<string, number> = {
  'text-2xs': 11,
  'text-xs': 13,
  'text-sm': 15,
  'text-base': 17,
}

const contextFor = (file: string, text: string, globalReducedMotion = false): StaticContext => ({
  file,
  sourceFile: parseSource(file, text),
  config: { navigateFunctions: ['navigate'], placeholderConstantPattern: /PLACEHOLDER/ },
  resolveFontSize: (utility) => FONT_SIZES[utility] ?? null,
  globalReducedMotion,
})

/** 줄마다 `✗` 개수만큼 그 줄 번호를 늘어놓는다. */
const markedLines = (text: string) =>
  text.split('\n').flatMap((line, index) => Array(line.split('✗').length - 1).fill(index + 1))

const run = (rule: StaticRule, kind: 'fail' | 'pass', globalReducedMotion = false) => {
  const name = rule.id.replace('krds/', '')
  const file = `${name}/${kind}.tsx`
  const text = readFileSync(`${FIXTURES}${file}`, 'utf8')
  const findings = rule.check(contextFor(file, text, globalReducedMotion))

  return { text, findings }
}

describe('STATIC_RULES', () => {
  it('카탈로그의 정적 규칙과 하나씩 맞는다', () => {
    const catalog = RULES.filter((rule) => rule.engine === 'static').map((rule) => rule.id)

    expect(STATIC_RULES.map((rule) => rule.id)).toEqual(catalog)
  })
})

describe.each(STATIC_RULES.map((rule) => [rule.id, rule] as const))('%s', (_, rule) => {
  it('fail.tsx에서 ✗ 자리를 정확히 잡는다', () => {
    const { text, findings } = run(rule, 'fail')

    expect(findings.map((finding) => finding.line).sort((a, b) => a - b)).toEqual(markedLines(text))
    for (const finding of findings) {
      expect(finding).toMatchObject({
        ruleId: rule.id,
        file: `${rule.id.replace('krds/', '')}/fail.tsx`,
      })
      expect(finding.snippet.length).toBeGreaterThan(0)
      expect(finding.column).toBeGreaterThan(0)
    }
  })

  it('pass.tsx에서는 아무것도 잡지 않는다', () => {
    expect(run(rule, 'pass').findings).toEqual([])
  })
})

describe('krds/motion-reduce', () => {
  it('전역 reduced-motion 규칙이 있으면 잡지 않는다', () => {
    const rule = STATIC_RULES.find((r) => r.id === 'krds/motion-reduce')

    expect(rule && run(rule, 'fail', true).findings).toEqual([])
  })
})
