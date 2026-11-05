import type { StaticRule } from '../types.js'

export const visibleLabel: StaticRule = {
  id: 'krds/visible-label',
  check: (context) => {
    void context
    throw new Error('not implemented')
  },
}
