import { findingAt } from '../finding.js'
import { attribute, handlerOf, jsxTags, navigates, tagName } from '../jsx.js'
import type { StaticRule } from '../types.js'

export const noChangeOnInput: StaticRule = {
  id: 'krds/no-change-on-input',
  check: (context) =>
    jsxTags(context.sourceFile).flatMap((tag) => {
      if (tagName(tag) !== 'select') return []

      const handler = handlerOf(context.sourceFile, attribute(tag, 'onChange'))
      if (!handler || !navigates(handler, context.config.navigateFunctions, true)) return []

      return [findingAt(context, 'krds/no-change-on-input', tag.getStart(), 'select')]
    }),
}
