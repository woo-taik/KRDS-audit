import { currentRoute, pageFinding, runSteps } from '../scenario.js'
import type { RuntimeRule } from '../types.js'

export const searchInputOnResults: RuntimeRule = {
  id: 'krds/search-input-on-results',
  scope: 'scenario',
  check: async (context) => {
    const scenario = context.config.scenarios.search
    if (!scenario) return []

    const page = await runSteps(context, scenario.steps)
    const input = page.locator(scenario.input).first()
    const value = (await input.isVisible()) ? await input.inputValue() : null

    return value === scenario.query
      ? []
      : [
          pageFinding(
            'krds/search-input-on-results',
            currentRoute(page),
            context.viewport,
            ':root',
            scenario.input,
          ),
        ]
  },
}
