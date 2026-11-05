import { describe, expect, it } from 'vitest'
import { RENDER_REPORT } from '../test/render-report.js'
import { renderJson } from './render-json.js'

describe('renderJson', () => {
  it('2칸 들여쓰기에 끝 줄바꿈이고, 되읽으면 같은 보고서다', () => {
    const text = renderJson(RENDER_REPORT)

    expect(text.endsWith('}\n')).toBe(true)
    expect(text.split('\n')[1]).toBe('  "tool": {')
    expect(JSON.parse(text)).toEqual(RENDER_REPORT)
  })

  it('최상위 키는 tool·target·summary·rules·baseline 순이다', () => {
    expect(Object.keys(JSON.parse(renderJson(RENDER_REPORT)))).toEqual([
      'tool',
      'target',
      'summary',
      'rules',
      'baseline',
    ])
  })
})
