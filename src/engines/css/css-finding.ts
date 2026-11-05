import type { Node } from 'postcss'
import type { RuleId } from '../../catalog/rules.js'
import type { SourceFinding } from '../types.js'

/**
 * CSS 위반 하나. `node`가 있으면 그 시작 자리, null이면(있어야 할 것이 없을 때) 파일 1줄 1칸이다.
 */
export function cssFinding(
  ruleId: RuleId,
  file: string,
  node: Node | null,
  snippet: string,
): SourceFinding {
  void ruleId
  void file
  void node
  void snippet
  throw new Error('not implemented')
}
