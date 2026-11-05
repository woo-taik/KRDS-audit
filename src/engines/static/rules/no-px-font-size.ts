import { findingAt } from '../finding.js'
import { classTokensByAttribute } from '../jsx.js'
import type { StaticRule } from '../types.js'

const PX_FONT_SIZE = /^text-\[(length:)?\d*\.?\d+px\]$/

export const noPxFontSize: StaticRule = {
  id: 'krds/no-px-font-size',
  check: (context) =>
    classTokensByAttribute(context.sourceFile)
      .flatMap(({ tokens }) => tokens)
      .filter(({ token }) => PX_FONT_SIZE.test(token.utility))
      .map(({ token, offset }) => findingAt(context, 'krds/no-px-font-size', offset, token.raw)),
}
