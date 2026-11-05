import type { ClassToken } from './types.js'

/**
 * 클래스 문자열을 토큰으로 쪼갠다. 공백은 `[]`·`()` 밖에서만 가르고, 변형의 `:`도 그 밖에서만 가른다
 * — `bg-[url('/a:b.svg')]`·`[&>:last-child]:after:x`가 있어서다.
 */
export function splitClassTokens(text: string): ClassToken[] {
  void text
  throw new Error('not implemented')
}
