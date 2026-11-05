import { isStillProperty } from '../../motion.js'
import { findingAt } from '../finding.js'
import { classTokensByAttribute } from '../jsx.js'
import type { StaticRule } from '../types.js'

const MOVING_TRANSITIONS = new Set(['transition', 'transition-all', 'transition-transform'])

function moves(utility: string): boolean {
  if (MOVING_TRANSITIONS.has(utility)) return true

  const arbitrary = /^transition-\[(.+)\]$/.exec(utility)
  if (arbitrary) {
    return (arbitrary[1] ?? '').split(',').some((property) => !isStillProperty(property.trim()))
  }

  return utility.startsWith('animate-') && utility !== 'animate-none'
}

export const motionReduce: StaticRule = {
  id: 'krds/motion-reduce',
  check: (context) => {
    if (context.globalReducedMotion) return []

    return classTokensByAttribute(context.sourceFile).flatMap(({ tokens }) => {
      if (tokens.some(({ token }) => token.variants.includes('motion-reduce'))) return []

      return tokens
        .filter(({ token }) => !token.variants.includes('motion-safe') && moves(token.utility))
        .map(({ token, offset }) => findingAt(context, 'krds/motion-reduce', offset, token.raw))
    })
  },
}
