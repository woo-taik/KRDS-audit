import type { Root } from 'postcss'
import type { ThemeTokens } from './types.js'

/**
 * `@theme` 블록(`@theme inline`·`@theme static` 포함, 중첩 위치 무관)의 `--*` 선언을 순서대로 겹친다.
 * `--<ns>-*: initial`은 그 이름공간을, `--*: initial`은 전부를 그 자리에서 비운다.
 * 값 하나가 `initial`이면 그 토큰만 지운다.
 */
export function collectThemeTokens(roots: readonly Root[]): ThemeTokens {
  void roots
  throw new Error('not implemented')
}
