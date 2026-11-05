import ts from 'typescript'
import { collectStringValues } from '../class-strings.js'
import { findingAt } from '../finding.js'
import { attribute, attributeExpression, jsxTags } from '../jsx.js'
import type { ClassString, StaticRule } from '../types.js'

const HINT = /예\)|예:|예시/

export const placeholderNoHint: StaticRule = {
  id: 'krds/placeholder-no-hint',
  check: (context) => {
    const { sourceFile, config } = context
    const strings: ClassString[] = []

    for (const tag of jsxTags(sourceFile)) {
      const attr = attribute(tag, 'placeholder')
      const value = attr?.initializer
      if (value && ts.isStringLiteral(value)) {
        strings.push({ text: value.text, start: value.getStart() + 1 })
      }

      const expression = attributeExpression(attr)
      if (expression) strings.push(...collectStringValues(sourceFile, expression))
    }

    const visit = (node: ts.Node) => {
      if (
        (ts.isParameter(node) || ts.isBindingElement(node)) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'placeholder' &&
        node.initializer
      ) {
        strings.push(...collectStringValues(sourceFile, node.initializer))
      }

      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.initializer &&
        config.placeholderConstantPattern.test(node.name.text)
      ) {
        strings.push(...collectStringValues(sourceFile, node.initializer))
      }

      ts.forEachChild(node, visit)
    }
    visit(sourceFile)

    // 속성과 상수 패턴 양쪽에서 같은 문자열을 만날 수 있다.
    const unique = new Map<number, ClassString>()
    for (const piece of strings) if (HINT.test(piece.text)) unique.set(piece.start, piece)

    return [...unique.values()]
      .sort((a, b) => a.start - b.start)
      .map((piece) => findingAt(context, 'krds/placeholder-no-hint', piece.start, piece.text))
  },
}
