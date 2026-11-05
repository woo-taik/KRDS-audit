import { axeAria } from './rules/axe-aria.js'
import { contrast } from './rules/contrast.js'
import { focusVisible } from './rules/focus-visible.js'
import { govBanner } from './rules/gov-banner.js'
import { reducedMotionRuntime } from './rules/reduced-motion-runtime.js'
import { searchInputOnResults } from './rules/search-input-on-results.js'
import { searchOnEveryScreen } from './rules/search-on-every-screen.js'
import { searchResetConditions } from './rules/search-reset-conditions.js'
import { searchResultCount } from './rules/search-result-count.js'
import { searchScopeShown } from './rules/search-scope-shown.js'
import { skipLink } from './rules/skip-link.js'
import { targetSize } from './rules/target-size.js'
import { zoomFiveSteps } from './rules/zoom-five-steps.js'
import { zoomPersists } from './rules/zoom-persists.js'
import { zoomScalesText } from './rules/zoom-scales-text.js'
import type { RuntimeRule } from './types.js'

export const RUNTIME_RULES: readonly RuntimeRule[] = [
  zoomScalesText,
  zoomFiveSteps,
  zoomPersists,
  govBanner,
  skipLink,
  searchOnEveryScreen,
  searchInputOnResults,
  searchResultCount,
  searchScopeShown,
  searchResetConditions,
  reducedMotionRuntime,
  focusVisible,
  targetSize,
  contrast,
  axeAria,
]
