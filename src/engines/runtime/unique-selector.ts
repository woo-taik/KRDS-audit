import type { ElementHandle } from 'playwright'

/**
 * 요소를 다시 찾을 수 있는 셀렉터. 같은 DOM이면 언제나 같은 문자열이다.
 * - `html` → `:root`, `body` → `body`
 * - 문서에서 하나뿐인 id가 있으면 `#id`(CSS.escape)
 * - 아니면 부모 셀렉터 + ` > ` + `태그:nth-of-type(n)`
 */
export async function uniqueSelector(element: ElementHandle<Element>): Promise<string> {
  void element
  throw new Error('not implemented')
}
