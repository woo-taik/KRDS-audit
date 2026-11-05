import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { RULES } from '../../../catalog/rules.js'
import { CSS_RULES } from '../css-rules.js'
import { parseCss } from '../parse-css.js'
import type { CssRule } from '../types.js'

const FIXTURES = fileURLToPath(new URL('../../../../fixtures/css/', import.meta.url))

/** 줄마다 `✗` 개수만큼 그 줄 번호를 늘어놓는다. */
const markedLines = (text: string) =>
  text.split('\n').flatMap((line, index) => Array(line.split('✗').length - 1).fill(index + 1))

const check = (rule: CssRule, ...sources: [file: string, text: string][]) =>
  rule.check({ sources: sources.map(([file, text]) => ({ file, root: parseCss(file, text) })) })

const ruleOf = (id: CssRule['id']) => {
  const rule = CSS_RULES.find((r) => r.id === id)
  if (!rule) throw new Error(`${id}가 CSS_RULES에 없다`)
  return rule
}

describe('CSS_RULES', () => {
  it('카탈로그의 CSS 규칙과 하나씩 맞는다', () => {
    const catalog = RULES.filter((rule) => rule.engine === 'css').map((rule) => rule.id)

    expect(CSS_RULES.map((rule) => rule.id)).toEqual(catalog)
  })
})

describe.each(CSS_RULES.map((rule) => [rule.id, rule] as const))('%s', (_, rule) => {
  const name = rule.id.replace('krds/', '')

  it('fail.css에서 ✗ 자리를 정확히 잡는다', () => {
    const file = `${name}/fail.css`
    const text = readFileSync(`${FIXTURES}${file}`, 'utf8')
    const findings = check(rule, [file, text])

    expect(findings.map((finding) => finding.line).sort((a, b) => a - b)).toEqual(markedLines(text))
    for (const finding of findings) {
      expect(finding).toMatchObject({ ruleId: rule.id, file })
      expect(finding.snippet.length).toBeGreaterThan(0)
      expect(finding.column).toBeGreaterThan(0)
    }
  })

  it('pass.css에서는 아무것도 잡지 않는다', () => {
    const file = `${name}/pass.css`

    expect(check(rule, [file, readFileSync(`${FIXTURES}${file}`, 'utf8')])).toEqual([])
  })
})

describe('있어야 할 것을 찾는 규칙은 대상 CSS 전부를 본다', () => {
  it.each([
    ['krds/font-family-declared', 'body { font-family: "Pretendard GOV", sans-serif; }'],
    ['krds/font-family-declared', ':root { font-family: system-ui; }'],
    ['krds/font-family-declared', '@theme { --default-font-family: "Pretendard GOV"; }'],
    [
      'krds/global-reduced-motion',
      '@media (prefers-reduced-motion: reduce) { * { transition: none; animation: none; } }',
    ],
    ['krds/high-contrast-mode', '@media (prefers-contrast: more) { :root { --line: #000; } }'],
  ] as const)('%s: 두 번째 파일에 있으면 통과한다', (id, second) => {
    expect(check(ruleOf(id), ['src/a.css', '.a { color: red; }'], ['src/b.css', second])).toEqual(
      [],
    )
  })

  it.each([
    'krds/font-family-declared',
    'krds/global-reduced-motion',
    'krds/high-contrast-mode',
  ] as const)('%s: 어디에도 없으면 첫 파일 1줄 1칸 하나만 낸다', (id) => {
    expect(
      check(ruleOf(id), ['src/a.css', '.a { color: red; }'], ['src/b.css', '.b { color: blue; }']),
    ).toEqual([expect.objectContaining({ ruleId: id, file: 'src/a.css', line: 1, column: 1 })])
  })

  it('대상 CSS가 하나도 없으면 판정할 것이 없다', () => {
    for (const rule of CSS_RULES) expect(check(rule)).toEqual([])
  })
})
