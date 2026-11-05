import type { ElementHandle, Page } from 'playwright'
import { PAGE_HELPERS } from './page-helpers.js'

/** 페이지에 도우미를 건다. 이미 있으면 그대로 둔다. */
export async function ensureHelpers(page: Page): Promise<void> {
  await page.evaluate(PAGE_HELPERS)
}

/**
 * 요소를 다시 찾을 수 있는 셀렉터. 같은 DOM이면 언제나 같은 문자열이다.
 * - `html` → `:root`, `body` → `body`
 * - 문서에서 하나뿐인 id가 있으면 `#id`(CSS.escape)
 * - 아니면 부모 셀렉터 + ` > ` + `태그:nth-of-type(n)`
 */
export async function uniqueSelector(element: ElementHandle<Element>): Promise<string> {
  return element.evaluate((node, helpers) => {
    // 도우미가 없는 페이지(직접 연 페이지)에서도 돌게 그 자리에서 건다.
    if (!window.__krds) (0, eval)(helpers)
    return window.__krds?.selector(node) ?? ''
  }, PAGE_HELPERS)
}
