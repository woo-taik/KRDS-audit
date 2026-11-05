import { findingAt } from '../finding.js'
import { classTokensByAttribute } from '../jsx.js'
import type { StaticRule } from '../types.js'

const DISABLED = new Set(['disabled', 'aria-disabled', 'group-disabled', 'peer-disabled'])

export const noDisabledOpacity: StaticRule = {
  id: 'krds/no-disabled-opacity',
  check: (context) =>
    classTokensByAttribute(context.sourceFile)
      .flatMap(({ tokens }) => tokens)
      .filter(
        ({ token }) =>
          token.utility.startsWith('opacity-') && token.variants.some((v) => DISABLED.has(v)),
      )
      .map(({ token, offset }) =>
        findingAt(context, 'krds/no-disabled-opacity', offset, token.raw),
      ),
}
