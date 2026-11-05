import type { StaticRule } from '../types.js'

export const noHashHref: StaticRule = {
  id: 'krds/no-hash-href',
  check: (context) => {
    void context
    throw new Error('not implemented')
  },
}
