import { currentRoute, pageFinding, runSteps } from '../scenario.js'
import type { RuntimeRule } from '../types.js'

export const searchResetConditions: RuntimeRule = {
  id: 'krds/search-reset-conditions',
  scope: 'scenario',
  check: async (context) => {
    const scenario = context.config.scenarios.searchWithConditions
    if (!scenario) return []

    const page = await runSteps(context, scenario.steps)
    const shown = await page.locator(scenario.reset).filter({ visible: true }).count()

    return shown > 0
      ? []
      : [
          pageFinding(
            'krds/search-reset-conditions',
            currentRoute(page),
            context.viewport,
            ':root',
            scenario.reset,
          ),
        ]
  },
}
