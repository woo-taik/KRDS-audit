import ts from 'typescript'
import { findingAt } from '../finding.js'
import { attribute, jsxTags, staticValue, tagName, type JsxTag } from '../jsx.js'
import type { StaticRule } from '../types.js'

const UNLABELED_TYPES = new Set(['hidden', 'submit', 'button', 'search'])

/** JSX 조상을 거슬러 올라 `<label>` 안에 있는지. JSX가 끊기면(컴포넌트 경계) 멈춘다. */
function insideLabel(tag: JsxTag): boolean {
  let node: ts.Node = ts.isJsxOpeningElement(tag) ? tag.parent : tag

  while (node.parent) {
    const parent: ts.Node = node.parent

    if (ts.isJsxElement(parent)) {
      if (parent.openingElement.tagName.getText() === 'label') return true
    } else if (!ts.isJsxFragment(parent) && !ts.isJsxExpression(parent)) {
      return false
    }
    node = parent
  }

  return false
}

export const visibleLabel: StaticRule = {
  id: 'krds/visible-label',
  check: (context) => {
    const tags = jsxTags(context.sourceFile)
    const labelled = new Set(
      tags
        .filter((tag) => tagName(tag) === 'label')
        .map((tag) => staticValue(attribute(tag, 'htmlFor')))
        .filter((id): id is string => id !== null),
    )

    return tags.flatMap((tag) => {
      const name = tagName(tag)
      if (name !== 'input' && name !== 'textarea') return []
      if (!attribute(tag, 'aria-label') || attribute(tag, 'aria-labelledby')) return []

      const type = staticValue(attribute(tag, 'type'))
      if (type !== null && UNLABELED_TYPES.has(type)) return []
      if (staticValue(attribute(tag, 'role')) === 'searchbox') return []
      if (insideLabel(tag)) return []

      const idAttribute = attribute(tag, 'id')
      if (idAttribute) {
        const id = staticValue(idAttribute)
        // id를 정할 수 없으면 판정하지 않는다.
        if (id === null || labelled.has(id)) return []
      }

      return [findingAt(context, 'krds/visible-label', tag.getStart(), name)]
    })
  },
}
