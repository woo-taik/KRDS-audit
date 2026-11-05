import type ts from 'typescript'
import type { RuleId } from '../../catalog/rules.js'
import type { SourceFinding } from '../types.js'

/** 대상 레포마다 다른 것. `krds.config.ts`에서 온다. */
export type StaticConfig = {
  /** 호출하면 다른 화면으로 가는 함수 이름(`navigate` 등). */
  navigateFunctions: readonly string[]
  /** 이름이 이 패턴에 맞는 상수는 플레이스홀더 문구로 본다. */
  placeholderConstantPattern: RegExp
}

export type StaticContext = {
  /** 대상 레포 기준 상대 경로, `/` 구분. */
  file: string
  sourceFile: ts.SourceFile
  config: StaticConfig
  /** 테마 글자 유틸리티(`text-sm`)의 px 값. 글자 크기가 아니거나 모르면 null. 임의 값은 규칙이 푼다. */
  resolveFontSize: (utility: string) => number | null
  /** CSS 엔진이 전역 reduced-motion 규칙을 찾았는지. */
  globalReducedMotion: boolean
}

export type StaticFinding = SourceFinding

export type StaticRule = {
  id: RuleId
  check: (context: StaticContext) => StaticFinding[]
}

/** 클래스 문자열 하나. `start`는 `text` 첫 글자의 파일 내 위치다(따옴표 다음). */
export type ClassString = {
  text: string
  start: number
}

/** 클래스를 받는 JSX 속성 하나(`className`·`class`·`*ClassName`)와 거기서 모은 문자열. */
export type ClassAttribute = {
  name: string
  /** 속성 이름의 파일 내 위치. */
  start: number
  strings: ClassString[]
}

export type ClassToken = {
  raw: string
  /** 바깥에서 안쪽 순서(`md:hover:x` → `['md', 'hover']`). */
  variants: string[]
  /** 변형과 `!`를 뗀 유틸리티. */
  utility: string
  important: boolean
  /** `raw`가 클래스 문자열 안에서 시작하는 위치. */
  offset: number
}
