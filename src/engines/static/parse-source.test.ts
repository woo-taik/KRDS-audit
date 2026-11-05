import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { parseSource } from './parse-source.js'

describe('parseSource', () => {
  it('.ts 확장자여도 JSX를 읽는다', () => {
    const sourceFile = parseSource('a.ts', 'export const A = () => <div className="x" />')
    let sawJsx = false

    const visit = (node: ts.Node) => {
      if (ts.isJsxSelfClosingElement(node)) sawJsx = true
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)

    expect(sawJsx).toBe(true)
  })

  it('부모 연결을 만든다 — 규칙이 감싸는 요소를 거슬러 오른다', () => {
    const sourceFile = parseSource('a.tsx', 'const a = 1')
    const statement = sourceFile.statements[0]

    expect(statement?.parent).toBe(sourceFile)
  })
})
