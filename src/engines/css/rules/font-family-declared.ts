import type { CssRule } from '../types.js'

export const fontFamilyDeclared: CssRule = {
  id: 'krds/font-family-declared',
  check: (context) => {
    void context
    throw new Error('not implemented')
  },
}
