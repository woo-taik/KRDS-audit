import { currentRoute, pageFinding, runSteps } from '../scenario.js'
import type { RuntimeRule } from '../types.js'

export const searchScopeShown: RuntimeRule = {
  id: 'krds/search-scope-shown',
  scope: 'scenario',
  check: async (context) => {
    const scenario = context.config.scenarios.searchWithConditions
    if (!scenario) return []

    const page = await runSteps(context, scenario.steps)
    const scope = scenario.area ? page.locator(scenario.area) : page
    const findings = []

    for (const label of scenario.labels) {
      // 글이 정확히 그 라벨인 요소만 — '법령검색' 같은 메뉴 글에 걸리지 않게.
      const shown = await scope.getByText(label, { exact: true }).filter({ visible: true }).count()
      if (shown === 0) {
        findings.push(
          pageFinding(
            'krds/search-scope-shown',
            currentRoute(page),
            context.viewport,
            ':root',
            label,
          ),
        )
      }
    }

    return findings
  },
}
