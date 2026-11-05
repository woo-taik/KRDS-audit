import { ROOT_FONT_SIZE_PX } from '../../css/font-size-resolver.js'
import { findingAt } from '../finding.js'
import { classTokensByAttribute } from '../jsx.js'
import type { StaticContext, StaticRule } from '../types.js'

const MIN_PX = 13
const ARBITRARY = /^text-\[(?:length:)?(\d*\.?\d+)(px|rem)\]$/

/** 임의 값은 여기서 풀고, 테마 유틸리티는 CSS 엔진이 넘긴 해석기에 맡긴다. */
function fontSizeOf(utility: string, context: StaticContext): number | null {
  const arbitrary = ARBITRARY.exec(utility)
  if (arbitrary) {
    const value = Number(arbitrary[1])
    return arbitrary[2] === 'rem' ? value * ROOT_FONT_SIZE_PX : value
  }
  if (utility.startsWith('text-[')) return null
  return context.resolveFontSize(utility)
}

export const minFontSize: StaticRule = {
  id: 'krds/min-font-size',
  check: (context) =>
    classTokensByAttribute(context.sourceFile)
      .flatMap(({ tokens }) => tokens)
      .filter(({ token }) => {
        const size = fontSizeOf(token.utility, context)
        return size !== null && size < MIN_PX
      })
      .map(({ token, offset }) => findingAt(context, 'krds/min-font-size', offset, token.raw)),
}
