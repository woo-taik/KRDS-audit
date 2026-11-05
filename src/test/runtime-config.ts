import type { RuntimeConfig } from '../config/types.js'

/** 화면 테스트가 함께 쓰는 설정. fixture가 routes·viewports·scenarios를 덮는다. */
export const TEST_RUNTIME_CONFIG: RuntimeConfig = {
  routes: [{ path: '/', popup: false, ready: null }],
  viewports: [1280],
  scenarioViewport: 1280,
  height: 900,
  maxTabStops: 50,
  ready: null,
  timeout: 30_000,
  selectors: {
    banner: '[data-banner]',
    search: '[data-search]',
    zoomIn: '[data-zoom-in]',
    zoomOut: '[data-zoom-out]',
    textSample: '[data-text-sample]',
  },
  scenarios: { search: null, searchWithConditions: null },
}
