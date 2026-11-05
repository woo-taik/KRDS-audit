import type { RuleId } from '../catalog/rules.js'

/** 소스 파일 안 한 자리를 가리키는 위반. 정적·CSS 엔진이 함께 낸다. */
export type SourceFinding = {
  ruleId: RuleId
  /** 대상 레포 기준 상대 경로, `/` 구분. */
  file: string
  /** 1부터 센다. */
  line: number
  column: number
  /** 위반한 토큰·태그·선언, 없는 것을 알릴 때는 없어야 할 것의 이름. 식별자 해시의 재료다. */
  snippet: string
}

/** 화면 검사가 그린 페이지 안 한 요소를 가리키는 위반. */
export type PageFinding = {
  ruleId: RuleId
  /** 설정에 적은 경로(`/search?q=…`). */
  route: string
  /** 창 폭(px). */
  viewport: number
  /** 요소를 다시 찾을 수 있는 CSS 셀렉터. 페이지 전체를 가리키면 `:root`다. */
  selector: string
  snippet: string
}

/** 엔진에 넘기는 파일 하나. */
export type SourceText = {
  /** 대상 레포 기준 상대 경로, `/` 구분. */
  file: string
  text: string
}
