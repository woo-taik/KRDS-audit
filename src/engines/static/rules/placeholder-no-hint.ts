import type { StaticRule } from '../types.js'

export const placeholderNoHint: StaticRule = {
  id: 'krds/placeholder-no-hint',
  check: (context) => {
    void context
    throw new Error('not implemented')
  },
}
