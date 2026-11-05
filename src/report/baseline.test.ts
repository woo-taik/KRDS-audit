import { describe, expect, it } from 'vitest'
import { compareBaseline, parseBaseline, serializeBaseline } from './baseline.js'

describe('parseBaseline', () => {
  it('판 1의 식별자 목록을 읽는다', () => {
    expect(parseBaseline('{"version":1,"fingerprints":["b","a"]}')).toEqual({
      version: 1,
      fingerprints: ['b', 'a'],
    })
  })

  it.each([
    ['not json', /JSON/],
    ['[]', /객체/],
    ['{"version":2,"fingerprints":[]}', /version/],
    ['{"version":1}', /fingerprints/],
    ['{"version":1,"fingerprints":[1]}', /fingerprints/],
  ])('틀리면 까닭을 담아 던진다: %s', (text, reason) => {
    expect(() => parseBaseline(text)).toThrow(reason)
  })
})

describe('serializeBaseline', () => {
  it('정렬·중복 제거한 2칸 들여쓰기 JSON에 끝 줄바꿈이다', () => {
    expect(serializeBaseline(['b', 'a', 'b'])).toBe(
      '{\n  "version": 1,\n  "fingerprints": [\n    "a",\n    "b"\n  ]\n}\n',
    )
  })

  it('비어도 같은 모양이다', () => {
    expect(serializeBaseline([])).toBe('{\n  "version": 1,\n  "fingerprints": []\n}\n')
  })

  it('읽은 것을 다시 쓰면 같다', () => {
    const text = serializeBaseline(['c', 'a'])

    expect(serializeBaseline(parseBaseline(text).fingerprints)).toBe(text)
  })
})

describe('compareBaseline', () => {
  it('새 것과 해소된 것을 정렬해 가른다', () => {
    expect(compareBaseline(['d', 'a', 'c'], { version: 1, fingerprints: ['b', 'a', 'e'] })).toEqual(
      { added: ['c', 'd'], resolved: ['b', 'e'] },
    )
  })

  it('같으면 둘 다 비었다', () => {
    expect(compareBaseline(['a'], { version: 1, fingerprints: ['a'] })).toEqual({
      added: [],
      resolved: [],
    })
  })
})
