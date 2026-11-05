import type { RuleId } from '../../catalog/rules.js'
import type { StaticContext, StaticFinding } from './types.js'

/** 파일 내 위치(`offset`)를 1부터 세는 줄·칸으로 바꿔 위반 하나를 만든다. */
export function findingAt(
  context: StaticContext,
  ruleId: RuleId,
  offset: number,
  snippet: string,
): StaticFinding {
  void context
  void ruleId
  void offset
  void snippet
  throw new Error('not implemented')
}
