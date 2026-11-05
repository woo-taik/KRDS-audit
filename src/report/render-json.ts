import type { Report } from './types.js'

/** 2칸 들여 쓴 JSON에 끝 줄바꿈. 키 순서는 `Report` 타입 선언 순서다. */
export function renderJson(report: Report): string {
  const { tool, target, summary, rules, baseline } = report

  return `${JSON.stringify({ tool, target, summary, rules, baseline }, null, 2)}\n`
}
