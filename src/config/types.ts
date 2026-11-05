import type { RuleId } from '../catalog/rules.js'

/** 시나리오의 한 단계. 코드가 아니라 단계로 적어 같은 설정이면 같은 동작이 된다. */
export type ScenarioStep =
  | { action: 'goto'; path: string }
  | { action: 'fill'; selector: string; value: string }
  | { action: 'select'; selector: string; value: string }
  | { action: 'click'; selector: string }
  | { action: 'press'; key: string }
  | { action: 'waitFor'; selector: string }

export type RouteConfig = {
  path: string
  /** 사이트 골격 없이 따로 여는 창. 공식 배너·검색 진입 규칙에서 뺀다. */
  popup: boolean
}

export type SearchScenario = {
  steps: ScenarioStep[]
  /** 결과 화면의 검색어 입력. */
  input: string
  /** 단계에서 보낸 검색어. 결과 화면 입력의 값과 견준다. */
  query: string
  /** 결과 수가 적힌 요소. */
  resultCount: string
}

export type ConditionScenario = {
  steps: ScenarioStep[]
  /** 조건을 건 뒤 결과 화면에 보여야 할 조건 라벨. */
  labels: string[]
  /** 조건을 한 번에 해제하는 컨트롤. */
  reset: string
}

export type RuntimeConfig = {
  routes: RouteConfig[]
  /** 작은 것부터 정렬했다. */
  viewports: number[]
  /** 시나리오 규칙을 돌릴 폭. */
  scenarioViewport: number
  /** 창 높이 — 폭마다 같다. */
  height: number
  /** 포커스 검사에서 Tab을 누르는 최대 횟수. */
  maxTabStops: number
  /** 이 설정의 셀렉터는 모두 Playwright 셀렉터다 — CSS 외에 `text=…`도 된다. */
  selectors: {
    banner: string
    search: string
    zoomIn: string
    zoomOut: string
    /** 글자 크기 조절 전후로 잴 표본 글자. */
    textSample: string
  }
  scenarios: {
    search: SearchScenario | null
    searchWithConditions: ConditionScenario | null
  }
}

/** 기본값을 채운 설정. 엔진은 이것만 받는다. */
export type KrdsConfig = {
  name: string
  /** 정적 엔진이 읽을 TS·TSX glob. */
  sources: string[]
  exclude: string[]
  /** 대상이 직접 쓴 CSS. 이 순서로 토큰을 겹친다. */
  css: string[]
  static: {
    navigateFunctions: string[]
    placeholderConstantPattern: RegExp
  }
  /** 정렬했다. */
  notApplicable: RuleId[]
  /** 대상 레포 기준 기준선 경로. */
  baseline: string
  runtime: RuntimeConfig | null
}
