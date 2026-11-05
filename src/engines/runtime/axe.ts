import { AxeBuilder } from '@axe-core/playwright'
import type { Page } from 'playwright'
import type { RuleId } from '../../catalog/rules.js'
import type { PageFinding } from '../types.js'
import { pageFinding } from './scenario.js'

type Run = (builder: AxeBuilder) => AxeBuilder

/** axe 위반 노드마다 하나. 셀렉터는 axe가 낸 target(프레임 안이면 ` >>> `로 잇는다), snippet은 axe 규칙 ID. */
export async function axeFindings(
  page: Page,
  ruleId: RuleId,
  route: string,
  viewport: number,
  configure: Run,
): Promise<PageFinding[]> {
  const { violations } = await configure(new AxeBuilder({ page })).analyze()

  return violations.flatMap((violation) =>
    violation.nodes.map((node) =>
      pageFinding(ruleId, route, viewport, node.target.map(String).join(' >>> '), violation.id),
    ),
  )
}
