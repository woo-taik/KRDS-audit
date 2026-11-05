import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { SourceText } from '../types.js'

const THEME_FILE = 'node_modules/tailwindcss/theme.css'

/**
 * 대상 레포가 설치한 Tailwind의 기본 테마(`tailwindcss/theme.css`)를 읽는다. 대상이 빌드할 때와 같은 판을
 * 쓰려고 이 도구의 의존성이 아니라 대상의 `node_modules`에서 푼다. 설치돼 있지 않으면 null이다.
 * `file`은 대상 레포 기준 상대 경로다(`node_modules/tailwindcss/theme.css`).
 */
export function readTailwindTheme(targetRoot: string): SourceText | null {
  // 모듈 해석은 상위 폴더로 거슬러 올라가 엉뚱한 판을 집을 수 있어 대상 바로 아래만 본다.
  try {
    return {
      file: THEME_FILE,
      text: readFileSync(join(targetRoot, ...THEME_FILE.split('/')), 'utf8'),
    }
  } catch {
    return null
  }
}
