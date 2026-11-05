import { fontFamilyDeclared } from './rules/font-family-declared.js'
import { globalReducedMotion } from './rules/global-reduced-motion.js'
import { highContrastMode } from './rules/high-contrast-mode.js'
import { themeFontRelative } from './rules/theme-font-relative.js'
import type { CssRule } from './types.js'

export const CSS_RULES: readonly CssRule[] = [
  themeFontRelative,
  fontFamilyDeclared,
  globalReducedMotion,
  highContrastMode,
]
