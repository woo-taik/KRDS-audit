import type { Rule } from '../catalog/types.js'
import type { Report } from './types.js'

/** 사람이 읽는 보고서. 모양은 `render-markdown.test.ts`의 기대 문자열이 정본이다. */
export function renderMarkdown(rules: readonly Rule[], report: Report): string {
  void rules
  void report
  throw new Error('not implemented')
}
