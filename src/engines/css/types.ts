import type { Root } from 'postcss'
import type { RuleId } from '../../catalog/rules.js'
import type { SourceFinding } from '../types.js'

/** `--text-sm` → `0.875rem`. 뒤에 선언한 값이 앞을 덮은 결과다. */
export type ThemeTokens = ReadonlyMap<string, string>

export type ParsedCss = {
  /** 대상 레포 기준 상대 경로, `/` 구분. */
  file: string
  root: Root
}

export type CssContext = {
  /** 대상 레포가 직접 쓴 CSS. Tailwind 기본 테마는 들지 않는다. 설정에 적은 순서다. */
  sources: readonly ParsedCss[]
}

export type CssRule = {
  id: RuleId
  check: (context: CssContext) => SourceFinding[]
}
