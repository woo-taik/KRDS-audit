import type { CssRule } from '../types.js'

export const highContrastMode: CssRule = {
  id: 'krds/high-contrast-mode',
  check: (context) => {
    void context
    throw new Error('not implemented')
  },
}
