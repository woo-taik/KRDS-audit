import type { ThemeTokens } from './types.js'

/** 브라우저 기본 루트 글자 크기. rem을 px로 옮길 때만 쓴다. */
export const ROOT_FONT_SIZE_PX = 16

const LENGTH = /^(\d*\.?\d+)(px|rem)$/

/**
 * 테마 글자 유틸리티(`text-sm`)를 px로 푼다. `--text-<이름>` 토큰이 px·rem 한 값일 때만 숫자를 내고,
 * 토큰이 없거나(`text-brand` 같은 색) `calc()`·`var()`·em이면 null이다. 임의 값(`text-[…]`)은 받지 않는다.
 */
export function fontSizeResolver(tokens: ThemeTokens): (utility: string) => number | null {
  return (utility) => {
    const name = /^text-([a-z0-9][a-z0-9-]*)$/.exec(utility)?.[1]
    if (!name || name.includes('--')) return null

    const length = LENGTH.exec(tokens.get(`--text-${name}`) ?? '')
    if (!length) return null

    const value = Number(length[1])
    return length[2] === 'rem' ? value * ROOT_FONT_SIZE_PX : value
  }
}
