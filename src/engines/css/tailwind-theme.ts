import type { SourceText } from '../types.js'

/**
 * 대상 레포가 설치한 Tailwind의 기본 테마(`tailwindcss/theme.css`)를 읽는다. 대상이 빌드할 때와 같은 판을
 * 쓰려고 이 도구의 의존성이 아니라 대상의 `node_modules`에서 푼다. 설치돼 있지 않으면 null이다.
 * `file`은 대상 레포 기준 상대 경로다(`node_modules/tailwindcss/theme.css`).
 */
export function readTailwindTheme(targetRoot: string): SourceText | null {
  void targetRoot
  throw new Error('not implemented')
}
