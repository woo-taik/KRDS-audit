import { minFontSize } from './rules/min-font-size.js'
import { motionReduce } from './rules/motion-reduce.js'
import { navigationIsLink } from './rules/navigation-is-link.js'
import { noChangeOnInput } from './rules/no-change-on-input.js'
import { noDisabledOpacity } from './rules/no-disabled-opacity.js'
import { noHashHref } from './rules/no-hash-href.js'
import { noPxFontSize } from './rules/no-px-font-size.js'
import { placeholderNoHint } from './rules/placeholder-no-hint.js'
import { visibleLabel } from './rules/visible-label.js'
import type { StaticRule } from './types.js'

export const STATIC_RULES: readonly StaticRule[] = [
  noPxFontSize,
  minFontSize,
  noDisabledOpacity,
  navigationIsLink,
  noHashHref,
  noChangeOnInput,
  placeholderNoHint,
  visibleLabel,
  motionReduce,
]
