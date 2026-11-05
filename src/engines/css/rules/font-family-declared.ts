import { cssFinding } from '../css-finding.js'
import { selectorList } from '../media.js'
import type { CssRule, ParsedCss } from '../types.js'

const FONT_TOKENS = new Set(['--font-sans', '--default-font-family'])
const ROOT_SELECTORS = new Set(['html', 'body', ':root'])

function declaresFont(sources: readonly ParsedCss[]): boolean {
  let found = false

  for (const { root } of sources) {
    root.walkAtRules('theme', (theme) => {
      theme.walkDecls((decl) => {
        if (FONT_TOKENS.has(decl.prop) && decl.value.trim() !== 'initial') found = true
      })
    })

    root.walkRules((rule) => {
      if (!selectorList(rule).some((selector) => ROOT_SELECTORS.has(selector))) return
      rule.walkDecls('font-family', () => {
        found = true
      })
    })
  }

  return found
}

export const fontFamilyDeclared: CssRule = {
  id: 'krds/font-family-declared',
  check: ({ sources }) => {
    const first = sources[0]
    if (!first || declaresFont(sources)) return []

    return [cssFinding('krds/font-family-declared', first.file, null, '--font-sans')]
  },
}
