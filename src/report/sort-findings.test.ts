import { describe, expect, it } from 'vitest'
import { compareFindings } from './sort-findings.js'
import type { AuditFinding } from './types.js'

const source = (file: string, line: number, column: number, ruleId: AuditFinding['ruleId']) =>
  ({ kind: 'source', ruleId, file, line, column, snippet: 's' }) as const

const page = (route: string, viewport: number, selector: string, ruleId: AuditFinding['ruleId']) =>
  ({ kind: 'page', ruleId, route, viewport, selector, snippet: 's' }) as const

describe('compareFindings', () => {
  it('소스가 화면보다 앞이다', () => {
    expect(
      [page('/', 360, 'a', 'krds/gov-banner'), source('z.tsx', 9, 9, 'krds/no-hash-href')]
        .sort(compareFindings)
        .map((f) => f.kind),
    ).toEqual(['source', 'page'])
  })

  it('소스는 파일·줄·칸·규칙 ID 순이다 — 줄은 숫자로 견준다', () => {
    const sorted = [
      source('b.tsx', 1, 1, 'krds/no-hash-href'),
      source('a.tsx', 10, 1, 'krds/no-hash-href'),
      source('a.tsx', 9, 2, 'krds/no-hash-href'),
      source('a.tsx', 9, 2, 'krds/min-font-size'),
      source('a.tsx', 9, 1, 'krds/no-hash-href'),
    ].sort(compareFindings)

    expect(sorted.map((f) => [f.file, f.line, f.column, f.ruleId])).toEqual([
      ['a.tsx', 9, 1, 'krds/no-hash-href'],
      ['a.tsx', 9, 2, 'krds/min-font-size'],
      ['a.tsx', 9, 2, 'krds/no-hash-href'],
      ['a.tsx', 10, 1, 'krds/no-hash-href'],
      ['b.tsx', 1, 1, 'krds/no-hash-href'],
    ])
  })

  it('화면은 경로·폭(작은 것부터)·셀렉터·규칙 ID 순이다', () => {
    const sorted = [
      page('/search', 360, 'a', 'krds/gov-banner'),
      page('/', 1280, 'a', 'krds/gov-banner'),
      page('/', 360, 'b', 'krds/gov-banner'),
      page('/', 360, 'a', 'krds/skip-link'),
      page('/', 360, 'a', 'krds/gov-banner'),
    ].sort(compareFindings)

    expect(sorted.map((f) => [f.route, f.viewport, f.selector, f.ruleId])).toEqual([
      ['/', 360, 'a', 'krds/gov-banner'],
      ['/', 360, 'a', 'krds/skip-link'],
      ['/', 360, 'b', 'krds/gov-banner'],
      ['/', 1280, 'a', 'krds/gov-banner'],
      ['/search', 360, 'a', 'krds/gov-banner'],
    ])
  })

  it('문자열은 로캘이 아니라 코드 포인트로 견준다', () => {
    const sorted = [
      source('b.tsx', 1, 1, 'krds/no-hash-href'),
      source('B.tsx', 1, 1, 'krds/no-hash-href'),
    ].sort(compareFindings)

    expect(sorted.map((f) => f.kind === 'source' && f.file)).toEqual(['B.tsx', 'b.tsx'])
  })
})
