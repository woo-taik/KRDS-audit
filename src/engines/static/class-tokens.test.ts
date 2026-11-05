import { describe, expect, it } from 'vitest'
import { splitClassTokens } from './class-tokens.js'

const pick = (text: string) =>
  splitClassTokens(text).map(({ raw, variants, utility, important, offset }) => ({
    raw,
    variants,
    utility,
    important,
    offset,
  }))

describe('splitClassTokens', () => {
  it('빈 문자열과 공백뿐인 문자열은 토큰이 없다', () => {
    expect(splitClassTokens('')).toEqual([])
    expect(splitClassTokens('  \n\t ')).toEqual([])
  })

  it('공백·줄바꿈·탭으로 가르고 시작 위치를 단다', () => {
    expect(pick('a  b\n\tc').map(({ raw, offset }) => [raw, offset])).toEqual([
      ['a', 0],
      ['b', 3],
      ['c', 6],
    ])
  })

  it('변형은 바깥에서 안쪽 순서다', () => {
    expect(pick('md:hover:text-sm')).toEqual([
      {
        raw: 'md:hover:text-sm',
        variants: ['md', 'hover'],
        utility: 'text-sm',
        important: false,
        offset: 0,
      },
    ])
  })

  it('대괄호 안의 콜론·공백으로는 가르지 않는다', () => {
    expect(pick("bg-[url('/a:b.svg')] grid-cols-[1fr_auto]").map((t) => t.utility)).toEqual([
      "bg-[url('/a:b.svg')]",
      'grid-cols-[1fr_auto]',
    ])
  })

  it('임의 변형과 data 변형을 하나의 변형으로 본다', () => {
    expect(pick('[&>:last-child]:after:animate-pulse')[0]).toMatchObject({
      variants: ['[&>:last-child]', 'after'],
      utility: 'animate-pulse',
    })
    expect(pick('group-data-[state=open]:rotate-180')[0]).toMatchObject({
      variants: ['group-data-[state=open]'],
      utility: 'rotate-180',
    })
  })

  it('임의 속성은 변형 없는 유틸리티다', () => {
    expect(pick('[--swiper-color:#fff]')[0]).toMatchObject({
      variants: [],
      utility: '[--swiper-color:#fff]',
    })
  })

  it('앞(v3)·뒤(v4)의 !는 important로 떼어 낸다', () => {
    expect(pick('!font-bold md:text-sm!')).toEqual([
      { raw: '!font-bold', variants: [], utility: 'font-bold', important: true, offset: 0 },
      { raw: 'md:text-sm!', variants: ['md'], utility: 'text-sm', important: true, offset: 11 },
    ])
  })

  it('음수 유틸리티의 -는 유틸리티에 남는다', () => {
    expect(pick('max-md:-mt-2')[0]).toMatchObject({ variants: ['max-md'], utility: '-mt-2' })
  })
})
