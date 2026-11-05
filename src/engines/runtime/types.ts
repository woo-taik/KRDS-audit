import type { Page } from 'playwright'
import type { RuleId } from '../../catalog/rules.js'
import type { RuntimeConfig } from '../../config/types.js'
import type { PageFinding } from '../types.js'

/** 경로 × 폭마다 한 번 도는 규칙이 받는 것. 페이지는 막 열어 불러온 상태다. */
export type PageRuleContext = {
  page: Page
  route: string
  popup: boolean
  viewport: number
  /** 이 경로의 준비 셀렉터. 규칙이 다시 불러올 때도 이것을 기다린다. */
  ready: string | null
  config: RuntimeConfig
}

export type OpenPageOptions = {
  reducedMotion?: 'reduce' | 'no-preference'
}

/** 시나리오 규칙이 받는 것. 같은 브라우저 컨텍스트에서 페이지를 연다 — 저장소가 이어져야 새로고침·팝업을 잰다. */
export type ScenarioRuleContext = {
  /** `path`는 기준 주소에 붙인다. 불러오기와 글꼴 준비가 끝난 뒤 돌려준다. */
  open: (path: string, options?: OpenPageOptions) => Promise<Page>
  viewport: number
  config: RuntimeConfig
}

export type RuntimeRule =
  | {
      id: RuleId
      scope: 'page'
      check: (context: PageRuleContext) => Promise<PageFinding[]>
    }
  | {
      id: RuleId
      scope: 'scenario'
      check: (context: ScenarioRuleContext) => Promise<PageFinding[]>
    }
