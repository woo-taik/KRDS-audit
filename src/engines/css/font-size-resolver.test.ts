import { describe, expect, it } from 'vitest'
import { fontSizeResolver } from './font-size-resolver.js'

const resolve = fontSizeResolver(
  new Map([
    ['--text-xs', '0.75rem'],
    ['--text-base', '17px'],
    ['--text-fluid', 'clamp(1rem, 2vw, 2rem)'],
    ['--text-var', 'var(--size)'],
    ['--text-em', '0.9em'],
    ['--text-xs--line-height', '1.5'],
    ['--color-brand', '#1f3c7a'],
  ]),
)

describe('fontSizeResolver', () => {
  it('rem은 16px 기준으로, px은 그대로 숫자로 낸다', () => {
    expect(resolve('text-xs')).toBe(12)
    expect(resolve('text-base')).toBe(17)
  })

  it('토큰이 없거나 글자 크기가 아니면 null이다', () => {
    expect(resolve('text-brand')).toBeNull()
    expect(resolve('text-lg')).toBeNull()
    expect(resolve('font-bold')).toBeNull()
  })

  it('calc·clamp·var·em은 정하지 않는다', () => {
    expect(resolve('text-fluid')).toBeNull()
    expect(resolve('text-var')).toBeNull()
    expect(resolve('text-em')).toBeNull()
  })

  it('하위 토큰(--text-xs--line-height)을 유틸리티로 보지 않는다', () => {
    expect(resolve('text-xs--line-height')).toBeNull()
  })

  it('임의 값은 받지 않는다 — 정적 규칙이 푼다', () => {
    expect(resolve('text-[13px]')).toBeNull()
  })
})
