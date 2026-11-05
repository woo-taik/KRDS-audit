import type { StaticRule } from '../types.js'

export const noChangeOnInput: StaticRule = {
  id: 'krds/no-change-on-input',
  check: (context) => {
    void context
    throw new Error('not implemented')
  },
}
