import { findingAt } from '../finding.js'
import { attribute, jsxTags, staticValue, tagName } from '../jsx.js'
import type { StaticRule } from '../types.js'

export const noHashHref: StaticRule = {
  id: 'krds/no-hash-href',
  check: (context) =>
    jsxTags(context.sourceFile).flatMap((tag) => {
      if (tagName(tag) !== 'a') return []

      const href = staticValue(attribute(tag, 'href'))
      if (href === null || (href !== '#' && !href.startsWith('javascript:'))) return []

      return [findingAt(context, 'krds/no-hash-href', tag.getStart(), href)]
    }),
}
