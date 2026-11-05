import type { StaticRule } from '../types.js'

export const motionReduce: StaticRule = {
  id: 'krds/motion-reduce',
  check: (context) => {
    void context
    throw new Error('not implemented')
  },
}
