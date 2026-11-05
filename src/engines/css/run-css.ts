import { compareSourceFindings } from '../compare.js'
import type { SourceFinding, SourceText } from '../types.js'
import { fontSizeResolver } from './font-size-resolver.js'
import { parseCss } from './parse-css.js'
import { hasGlobalReducedMotion } from './rules/global-reduced-motion.js'
import { collectThemeTokens } from './theme-tokens.js'
import type { CssRule } from './types.js'

export type RunCssOptions = {
  rules: readonly CssRule[]
  /** `readTailwindTheme`의 결과. 대상 규칙 판정에는 들지 않고 토큰 기본값으로만 쓴다. */
  tailwindTheme: SourceText | null
}

export type CssResult = {
  /** 파일·줄·칸·규칙 ID 순. */
  findings: SourceFinding[]
  /** Tailwind 기본 테마 위에 대상 CSS를 설정 순서대로 겹친 토큰으로 만든다. */
  resolveFontSize: (utility: string) => number | null
  /** `krds/global-reduced-motion`이 위반을 내지 않았는지. 정적 엔진의 `motion-reduce`가 읽는다. */
  globalReducedMotion: boolean
}

export function runCss(sources: readonly SourceText[], options: RunCssOptions): CssResult {
  const parsed = sources.map(({ file, text }) => ({ file, root: parseCss(file, text) }))
  const theme = options.tailwindTheme
    ? [parseCss(options.tailwindTheme.file, options.tailwindTheme.text)]
    : []

  return {
    findings: options.rules
      .flatMap((rule) => rule.check({ sources: parsed }))
      .sort(compareSourceFindings),
    resolveFontSize: fontSizeResolver(
      collectThemeTokens([...theme, ...parsed.map(({ root }) => root)]),
    ),
    // 규칙 목록을 거르더라도 정적 엔진에 넘길 값은 같아야 해서 규칙과 따로 잰다.
    globalReducedMotion: hasGlobalReducedMotion(parsed),
  }
}
