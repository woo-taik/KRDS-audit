import { currentRoute, pageFinding, runSteps } from '../scenario.js'
import type { RuntimeRule } from '../types.js'

export const searchResultCount: RuntimeRule = {
  id: 'krds/search-result-count',
  scope: 'scenario',
  check: async (context) => {
    const scenario = context.config.scenarios.search
    if (!scenario) return []

    const page = await runSteps(context, scenario.steps)
    const count = page.locator(scenario.resultCount).first()
    const text = (await count.isVisible()) ? await count.innerText() : ''

    return /\d/.test(text)
      ? []
      : [
          pageFinding(
            'krds/search-result-count',
            currentRoute(page),
            context.viewport,
            ':root',
            scenario.resultCount,
          ),
        ]
  },
}
