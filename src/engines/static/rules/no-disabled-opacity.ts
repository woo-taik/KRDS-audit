import type { StaticRule } from '../types.js'

export const noDisabledOpacity: StaticRule = {
  id: 'krds/no-disabled-opacity',
  check: (context) => {
    void context
    throw new Error('not implemented')
  },
}
