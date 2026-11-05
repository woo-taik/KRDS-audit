import type { AtRule, Rule } from 'postcss'
import type { ParsedCss } from './types.js'

/** 공백을 지운 미디어 조건 — `(forced-colors:active)`와 `(forced-colors: active)`를 같게 본다. */
export const mediaCondition = (rule: AtRule) => rule.params.replace(/\s+/g, '').toLowerCase()

export const selectorList = (rule: Rule) => rule.selectors.map((selector) => selector.trim())

/** 대상 CSS 전체에서 이 조건을 담은 `@media`가 하나라도 있는지. */
export function hasMedia(sources: readonly ParsedCss[], conditions: readonly string[]): boolean {
  let found = false

  for (const { root } of sources) {
    root.walkAtRules('media', (media) => {
      if (conditions.some((condition) => mediaCondition(media).includes(condition))) found = true
    })
  }

  return found
}
