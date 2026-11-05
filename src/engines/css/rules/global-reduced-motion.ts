import { cssFinding } from '../css-finding.js'
import { mediaCondition, selectorList } from '../media.js'
import type { CssRule, ParsedCss } from '../types.js'

const TRANSITION = new Set(['transition', 'transition-duration'])
const ANIMATION = new Set(['animation', 'animation-duration'])

/** 동작 줄이기 미디어 쿼리 안 전체 선택자(`*`) 규칙들이 transition과 animation을 둘 다 끄는지. */
export function hasGlobalReducedMotion(sources: readonly ParsedCss[]): boolean {
  let transition = false
  let animation = false

  for (const { root } of sources) {
    root.walkAtRules('media', (media) => {
      if (!mediaCondition(media).includes('prefers-reduced-motion:reduce')) return

      media.walkRules((rule) => {
        if (!selectorList(rule).includes('*')) return
        rule.walkDecls((decl) => {
          if (TRANSITION.has(decl.prop)) transition = true
          if (ANIMATION.has(decl.prop)) animation = true
        })
      })
    })
  }

  return transition && animation
}

export const globalReducedMotion: CssRule = {
  id: 'krds/global-reduced-motion',
  check: ({ sources }) => {
    const first = sources[0]
    if (!first || hasGlobalReducedMotion(sources)) return []

    return [
      cssFinding(
        'krds/global-reduced-motion',
        first.file,
        null,
        '@media (prefers-reduced-motion: reduce)',
      ),
    ]
  },
}
