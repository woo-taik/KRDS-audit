import { RULES, type RuleId } from '../catalog/rules.js'
import type {
  ConditionScenario,
  KrdsConfig,
  RouteConfig,
  RuntimeConfig,
  ScenarioStep,
  SearchScenario,
} from './types.js'

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

const DEFAULT_VIEWPORTS = [360, 768, 1280, 1920]

const SCENARIO_RULES: Record<'search' | 'searchWithConditions', RuleId[]> = {
  search: ['krds/search-input-on-results', 'krds/search-result-count'],
  searchWithConditions: ['krds/search-scope-shown', 'krds/search-reset-conditions'],
}

const RULE_IDS = new Set<string>(RULES.map((rule) => rule.id))

type JsonObject = Record<string, unknown>

const fail = (path: string, reason: string): never => {
  throw new ConfigError(path, reason)
}

const child = (path: string, key: string) => (path ? `${path}.${key}` : key)

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** 객체인지, 모르는 키가 없는지 본다 — 오타가 기본값으로 조용히 넘어가지 않게. */
function object(value: unknown, path: string, keys: readonly string[]): JsonObject {
  if (!isObject(value)) return fail(path, '객체여야 한다')

  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) fail(child(path, key), '모르는 키다')
  }

  return value
}

function nonEmpty(value: unknown, path: string): string {
  if (typeof value !== 'string') return fail(path, '문자열이어야 한다')
  if (value.trim().length === 0) return fail(path, '비어 있다')

  return value
}

function texts(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) return fail(path, '문자열 배열이어야 한다')

  return value.map((item, index) => nonEmpty(item, `${path}[${index}]`))
}

function positiveInteger(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return fail(path, '양의 정수여야 한다')
  }

  return value
}

function required(source: JsonObject, key: string, path: string): unknown {
  if (!(key in source)) fail(child(path, key), '빠졌다')

  return source[key]
}

const STEP_KEYS: Record<ScenarioStep['action'], readonly string[]> = {
  goto: ['path'],
  fill: ['selector', 'value'],
  select: ['selector', 'value'],
  click: ['selector'],
  press: ['key'],
  waitFor: ['selector'],
}

const isAction = (value: unknown): value is ScenarioStep['action'] =>
  typeof value === 'string' && Object.hasOwn(STEP_KEYS, value)

function step(value: unknown, path: string): ScenarioStep {
  if (!isObject(value)) return fail(path, '객체여야 한다')
  if (!isAction(value.action)) {
    return fail(child(path, 'action'), `${Object.keys(STEP_KEYS).join('·')} 가운데 하나여야 한다`)
  }

  const action = value.action
  const source = object(value, path, ['action', ...STEP_KEYS[action]])
  const field = (key: string) => nonEmpty(required(source, key, path), child(path, key))

  switch (action) {
    case 'goto':
      return { action, path: routePath(field('path'), child(path, 'path')) }
    case 'fill':
    case 'select':
      // 값은 빈 문자열(입력 지우기)도 뜻이 있어 문자열이기만 하면 받는다.
      if (typeof source.value !== 'string') fail(child(path, 'value'), '문자열이어야 한다')
      return { action, selector: field('selector'), value: String(source.value) }
    case 'click':
    case 'waitFor':
      return { action, selector: field('selector') }
    case 'press':
      return { action, key: field('key') }
  }
}

function steps(value: unknown, path: string): ScenarioStep[] {
  if (!Array.isArray(value) || value.length === 0) return fail(path, '단계가 하나 이상 있어야 한다')

  return value.map((item, index) => step(item, `${path}[${index}]`))
}

function routePath(value: string, path: string): string {
  if (!value.startsWith('/')) fail(path, '/로 시작해야 한다')

  return value
}

function searchScenario(value: unknown, path: string): SearchScenario | null {
  if (value == null) return null

  const source = object(value, path, ['steps', 'input', 'query', 'resultCount'])

  return {
    steps: steps(required(source, 'steps', path), child(path, 'steps')),
    input: nonEmpty(required(source, 'input', path), child(path, 'input')),
    query: nonEmpty(required(source, 'query', path), child(path, 'query')),
    resultCount: nonEmpty(required(source, 'resultCount', path), child(path, 'resultCount')),
  }
}

function conditionScenario(value: unknown, path: string): ConditionScenario | null {
  if (value == null) return null

  const source = object(value, path, ['steps', 'labels', 'area', 'reset'])
  const labels = texts(required(source, 'labels', path), child(path, 'labels'))
  if (labels.length === 0) fail(child(path, 'labels'), '라벨이 하나 이상 있어야 한다')

  return {
    steps: steps(required(source, 'steps', path), child(path, 'steps')),
    labels,
    area: source.area == null ? null : nonEmpty(source.area, child(path, 'area')),
    reset: nonEmpty(required(source, 'reset', path), child(path, 'reset')),
  }
}

function routes(value: unknown, path: string): RouteConfig[] {
  if (!Array.isArray(value) || value.length === 0) return fail(path, '경로가 하나 이상 있어야 한다')

  return value.map((item, index) => {
    const at = `${path}[${index}]`
    const source = object(item, at, ['path', 'popup', 'ready'])
    const popup = source.popup ?? false
    if (typeof popup !== 'boolean') fail(child(at, 'popup'), '불리언이어야 한다')

    return {
      path: routePath(nonEmpty(required(source, 'path', at), child(at, 'path')), child(at, 'path')),
      popup: Boolean(popup),
      ready: source.ready == null ? null : nonEmpty(source.ready, child(at, 'ready')),
    }
  })
}

function viewports(value: unknown, path: string): number[] {
  if (value == null) return [...DEFAULT_VIEWPORTS]
  if (!Array.isArray(value) || value.length === 0) return fail(path, '폭이 하나 이상 있어야 한다')

  const widths = value.map((item, index) => positiveInteger(item, `${path}[${index}]`))

  return [...new Set(widths)].sort((a, b) => a - b)
}

function runtime(value: unknown, path: string): RuntimeConfig | null {
  if (value == null) return null

  const source = object(value, path, [
    'routes',
    'viewports',
    'scenarioViewport',
    'height',
    'maxTabStops',
    'ready',
    'timeout',
    'selectors',
    'scenarios',
  ])
  const widths = viewports(source.viewports, child(path, 'viewports'))
  const scenarioViewport =
    source.scenarioViewport == null
      ? 1280
      : positiveInteger(source.scenarioViewport, child(path, 'scenarioViewport'))
  if (!widths.includes(scenarioViewport)) {
    fail(child(path, 'scenarioViewport'), 'viewports에 있는 폭이어야 한다')
  }

  const selectorsPath = child(path, 'selectors')
  const selectors = object(required(source, 'selectors', path), selectorsPath, [
    'banner',
    'search',
    'zoomIn',
    'zoomOut',
    'textSample',
  ])
  const selector = (key: string) =>
    nonEmpty(required(selectors, key, selectorsPath), child(selectorsPath, key))

  const scenariosPath = child(path, 'scenarios')
  const scenarios =
    source.scenarios == null
      ? {}
      : object(source.scenarios, scenariosPath, ['search', 'searchWithConditions'])

  return {
    routes: routes(required(source, 'routes', path), child(path, 'routes')),
    viewports: widths,
    scenarioViewport,
    height: source.height == null ? 900 : positiveInteger(source.height, child(path, 'height')),
    maxTabStops:
      source.maxTabStops == null
        ? 200
        : positiveInteger(source.maxTabStops, child(path, 'maxTabStops')),
    ready: source.ready == null ? null : nonEmpty(source.ready, child(path, 'ready')),
    timeout:
      source.timeout == null ? 30_000 : positiveInteger(source.timeout, child(path, 'timeout')),
    selectors: {
      banner: selector('banner'),
      search: selector('search'),
      zoomIn: selector('zoomIn'),
      zoomOut: selector('zoomOut'),
      textSample: selector('textSample'),
    },
    scenarios: {
      search: searchScenario(scenarios.search, child(scenariosPath, 'search')),
      searchWithConditions: conditionScenario(
        scenarios.searchWithConditions,
        child(scenariosPath, 'searchWithConditions'),
      ),
    },
  }
}

function notApplicable(value: unknown, path: string): RuleId[] {
  if (value == null) return []

  return texts(value, path)
    .map((id, index) =>
      RULE_IDS.has(id) ? (id as RuleId) : fail(`${path}[${index}]`, '모르는 규칙이다'),
    )
    .sort()
}

function staticConfig(value: unknown, path: string): KrdsConfig['static'] {
  const source =
    value == null ? {} : object(value, path, ['navigateFunctions', 'placeholderConstantPattern'])
  const patternPath = child(path, 'placeholderConstantPattern')
  const pattern =
    source.placeholderConstantPattern == null
      ? 'PLACEHOLDER'
      : nonEmpty(source.placeholderConstantPattern, patternPath)

  let placeholderConstantPattern: RegExp
  try {
    placeholderConstantPattern = new RegExp(pattern)
  } catch {
    return fail(patternPath, '정규식이 아니다')
  }

  return {
    navigateFunctions:
      source.navigateFunctions == null
        ? ['navigate']
        : texts(source.navigateFunctions, child(path, 'navigateFunctions')),
    placeholderConstantPattern,
  }
}

/**
 * `krds.config.json`을 읽어 기본값을 채운다. 대상 코드를 실행하지 않으려고 JSON이다.
 *
 * - 모르는 키는 오타로 보고 던진다.
 * - 기본값: `exclude` [], `static.navigateFunctions` ['navigate'], `static.placeholderConstantPattern` 'PLACEHOLDER',
 *   `notApplicable` [], `baseline` 'krds-baseline.json', `runtime` null,
 *   `runtime.viewports` [360, 768, 1280, 1920], `runtime.scenarioViewport` 1280, `runtime.height` 900,
 *   `runtime.maxTabStops` 200, `runtime.ready` null, `runtime.timeout` 30000, `routes[].ready` null, `routes[].popup` false, `runtime.scenarios.*` null.
 * - `notApplicable`은 카탈로그에 있는 ID만 받고 정렬한다. `viewports`는 양의 정수만 받고 정렬·중복 제거한다.
 * - `scenarioViewport`는 `viewports`에 있어야 한다.
 * - 시나리오가 null이면 그것에 기대는 규칙이 `notApplicable`에 있어야 한다 — 설정을 빠뜨린 것과
 *   해당 없음을 가르려는 것이다(검색 → search-input-on-results·search-result-count,
 *   조건 검색 → search-scope-shown·search-reset-conditions).
 */
export function parseConfig(text: string): KrdsConfig {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch (error) {
    return fail('', `JSON이 아니다 — ${(error as Error).message}`)
  }

  const source = object(raw, '', [
    'name',
    'sources',
    'exclude',
    'css',
    'static',
    'notApplicable',
    'baseline',
    'runtime',
  ])

  const config: KrdsConfig = {
    name: nonEmpty(required(source, 'name', ''), 'name'),
    sources: texts(required(source, 'sources', ''), 'sources'),
    exclude: source.exclude == null ? [] : texts(source.exclude, 'exclude'),
    css: texts(required(source, 'css', ''), 'css'),
    static: staticConfig(source.static, 'static'),
    notApplicable: notApplicable(source.notApplicable, 'notApplicable'),
    baseline:
      source.baseline == null ? 'krds-baseline.json' : nonEmpty(source.baseline, 'baseline'),
    runtime: runtime(source.runtime, 'runtime'),
  }

  if (config.runtime) {
    for (const key of ['search', 'searchWithConditions'] as const) {
      if (config.runtime.scenarios[key] !== null) continue

      const missing = SCENARIO_RULES[key].filter((id) => !config.notApplicable.includes(id))
      if (missing.length > 0) {
        fail(`runtime.scenarios.${key}`, `없으면 ${missing.join('·')}를 notApplicable에 적는다`)
      }
    }
  }

  return config
}
