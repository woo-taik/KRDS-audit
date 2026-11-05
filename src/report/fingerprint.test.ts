import { describe, expect, it } from 'vitest'
import { assignFingerprints } from './fingerprint.js'
import type { AuditFinding } from './types.js'

const hashHref = (
  overrides: Partial<Extract<AuditFinding, { kind: 'source' }>> = {},
): AuditFinding => ({
  kind: 'source',
  ruleId: 'krds/no-hash-href',
  file: 'src/a.tsx',
  line: 3,
  column: 5,
  snippet: '#',
  ...overrides,
})

const banner: AuditFinding = {
  kind: 'page',
  ruleId: 'krds/gov-banner',
  route: '/',
  viewport: 360,
  selector: ':root',
  snippet: 'banner',
}

const fingerprintOf = (finding: AuditFinding) => assignFingerprints([finding])[0]?.fingerprint

describe('assignFingerprints', () => {
  it('알고리즘을 고정한다 — 바뀌면 모든 대상의 기준선이 깨진다', () => {
    expect(fingerprintOf(hashHref())).toBe('cd589b6e8ca01915')
    expect(fingerprintOf(banner)).toBe('fa7fb30e65e391de')
  })

  it('소문자 16진 16자리다', () => {
    expect(fingerprintOf(hashHref())).toMatch(/^[0-9a-f]{16}$/)
  })

  it('줄·칸이 바뀌어도 같다', () => {
    expect(fingerprintOf(hashHref({ line: 40, column: 1 }))).toBe(fingerprintOf(hashHref()))
  })

  it('규칙·파일·snippet 가운데 하나라도 다르면 다르다', () => {
    const base = fingerprintOf(hashHref())

    expect(fingerprintOf(hashHref({ ruleId: 'krds/min-font-size' }))).not.toBe(base)
    expect(fingerprintOf(hashHref({ file: 'src/b.tsx' }))).not.toBe(base)
    expect(fingerprintOf(hashHref({ snippet: 'javascript:' }))).not.toBe(base)
  })

  it('같은 파일의 같은 snippet은 순번으로 가른다 — 위의 것이 0이다', () => {
    const [first, second] = assignFingerprints([hashHref({ line: 9 }), hashHref({ line: 2 })])

    expect(first).toMatchObject({ line: 2, fingerprint: 'cd589b6e8ca01915' })
    expect(second).toMatchObject({ line: 9 })
    expect(second?.fingerprint).not.toBe(first?.fingerprint)
  })

  it('입력 순서와 상관없이 같은 결과를 정렬해 낸다', () => {
    const a = assignFingerprints([banner, hashHref({ line: 9 }), hashHref()])
    const b = assignFingerprints([hashHref(), banner, hashHref({ line: 9 })])

    expect(a).toEqual(b)
    expect(a.map((f) => f.kind)).toEqual(['source', 'source', 'page'])
  })

  it('화면 위반은 폭이 다르면 다르다', () => {
    expect(fingerprintOf({ ...banner, viewport: 1280 })).not.toBe(fingerprintOf(banner))
  })
})
