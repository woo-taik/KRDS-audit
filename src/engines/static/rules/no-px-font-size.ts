import type { StaticRule } from '../types.js'

export const noPxFontSize: StaticRule = {
  id: 'krds/no-px-font-size',
  check: (context) => {
    void context
    throw new Error('not implemented')
  },
}
