import type { ClassToken } from './types.js'

const OPEN = new Set(['[', '('])
const CLOSE = new Set([']', ')'])

/** `text`를 깊이 0인 `separator`에서 가른다. 조각마다 시작 위치를 단다. */
function splitTopLevel(text: string, isSeparator: (char: string) => boolean) {
  const pieces: { text: string; offset: number }[] = []
  let depth = 0
  let start = 0

  for (let i = 0; i <= text.length; i++) {
    const char = text[i] ?? ''

    if (OPEN.has(char)) depth++
    else if (CLOSE.has(char)) depth = Math.max(0, depth - 1)

    if (i === text.length || (depth === 0 && isSeparator(char))) {
      pieces.push({ text: text.slice(start, i), offset: start })
      start = i + 1
    }
  }

  return pieces
}

/**
 * 클래스 문자열을 토큰으로 쪼갠다. 공백은 `[]`·`()` 밖에서만 가르고, 변형의 `:`도 그 밖에서만 가른다
 * — `bg-[url('/a:b.svg')]`·`[&>:last-child]:after:x`가 있어서다.
 */
export function splitClassTokens(text: string): ClassToken[] {
  return splitTopLevel(text, (char) => /\s/.test(char))
    .filter((piece) => piece.text.length > 0)
    .map(({ text: raw, offset }) => {
      const parts = splitTopLevel(raw, (char) => char === ':').map((part) => part.text)
      let utility = parts.at(-1) ?? ''
      let important = false

      if (utility.startsWith('!')) {
        important = true
        utility = utility.slice(1)
      } else if (utility.endsWith('!')) {
        important = true
        utility = utility.slice(0, -1)
      }

      return { raw, variants: parts.slice(0, -1), utility, important, offset }
    })
}
