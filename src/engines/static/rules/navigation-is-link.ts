import { findingAt } from '../finding.js'
import { attribute, handlerOf, jsxTags, navigates, tagName } from '../jsx.js'
import type { StaticRule } from '../types.js'

export const navigationIsLink: StaticRule = {
  id: 'krds/navigation-is-link',
  check: (context) =>
    jsxTags(context.sourceFile).flatMap((tag) => {
      if (tagName(tag) !== 'button') return []

      const handler = handlerOf(context.sourceFile, attribute(tag, 'onClick'))
      // 버튼으로 새 창을 띄우는 것은 화면 이동이 아니라 동작이라 window.open은 보지 않는다.
      if (!handler || !navigates(handler, context.config.navigateFunctions, false)) return []

      return [findingAt(context, 'krds/navigation-is-link', tag.getStart(), 'button')]
    }),
}
