import type { Declaration } from 'postcss'
import { cssFinding } from '../css-finding.js'
import type { CssRule } from '../types.js'

/** `--text-<이름>`만 — `--text-xs--line-height` 같은 하위 토큰과 `--text-*` 재설정은 뺀다. */
const isFontSizeToken = (prop: string) =>
  /^--text-[^*]+$/.test(prop) && !prop.slice('--text-'.length).includes('--')

const PX = /\d(?:\.\d+)?px\b/

export const themeFontRelative: CssRule = {
  id: 'krds/theme-font-relative',
  check: ({ sources }) =>
    sources.flatMap(({ file, root }) => {
      const declarations: Declaration[] = []

      root.walkAtRules('theme', (theme) => {
        theme.walkDecls((decl) => {
          if (isFontSizeToken(decl.prop) && PX.test(decl.value)) declarations.push(decl)
        })
      })

      return declarations.map((decl) =>
        cssFinding('krds/theme-font-relative', file, decl, decl.prop),
      )
    }),
}
