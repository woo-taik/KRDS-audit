import type { KrdsConfig } from './types.js'

export const CONFIG_FILE = 'krds.config.json'

/** 어느 키가 왜 틀렸는지 `path`에 담는다(`runtime.viewports[1]`). 최상위 오류는 `path`가 빈 문자열이다. */
export class ConfigError extends Error {
  constructor(
    readonly path: string,
    readonly reason: string,
  ) {
    super(path ? `${CONFIG_FILE} ${path}: ${reason}` : `${CONFIG_FILE}: ${reason}`)
  }
}

/**
 * `krds.config.json`을 읽어 기본값을 채운다. 대상 코드를 실행하지 않으려고 JSON이다.
 *
 * - 모르는 키는 오타로 보고 던진다.
 * - 기본값: `exclude` [], `static.navigateFunctions` ['navigate'], `static.placeholderConstantPattern` 'PLACEHOLDER',
 *   `notApplicable` [], `baseline` 'krds-baseline.json', `runtime` null,
 *   `runtime.viewports` [360, 768, 1280, 1920], `runtime.scenarioViewport` 1280, `runtime.height` 900,
 *   `runtime.maxTabStops` 200, `routes[].popup` false, `runtime.scenarios.*` null.
 * - `notApplicable`은 카탈로그에 있는 ID만 받고 정렬한다. `viewports`는 양의 정수만 받고 정렬·중복 제거한다.
 * - `scenarioViewport`는 `viewports`에 있어야 한다.
 * - 시나리오가 null이면 그것에 기대는 규칙이 `notApplicable`에 있어야 한다 — 설정을 빠뜨린 것과
 *   해당 없음을 가르려는 것이다(검색 → search-input-on-results·search-result-count,
 *   조건 검색 → search-scope-shown·search-reset-conditions).
 */
export function parseConfig(text: string): KrdsConfig {
  void text
  throw new Error('not implemented')
}
