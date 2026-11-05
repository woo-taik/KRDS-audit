import { describe, expect, it } from 'vitest'
import { ConfigError, parseConfig } from './parse-config.js'

const MINIMAL = { name: 'sample', sources: ['src/**/*.tsx'], css: ['src/app.css'] }

const SELECTORS = {
  banner: '[data-banner]',
  search: '[data-search]',
  zoomIn: '[data-zoom-in]',
  zoomOut: '[data-zoom-out]',
  textSample: 'main p',
}

const SEARCH_RULES = ['krds/search-input-on-results', 'krds/search-result-count']
const CONDITION_RULES = ['krds/search-scope-shown', 'krds/search-reset-conditions']

const runtime = (overrides: Record<string, unknown> = {}) => ({
  routes: [{ path: '/' }],
  selectors: SELECTORS,
  ...overrides,
})

const parse = (value: unknown) => parseConfig(JSON.stringify(value))

/** 던진 ConfigError의 path를 꺼낸다. */
const errorPath = (value: unknown) => {
  try {
    parse(value)
  } catch (error) {
    if (error instanceof ConfigError) return error.path
    throw error
  }
  throw new Error('던지지 않았다')
}

describe('parseConfig', () => {
  it('최소 설정에 기본값을 채운다', () => {
    expect(parse(MINIMAL)).toEqual({
      name: 'sample',
      sources: ['src/**/*.tsx'],
      exclude: [],
      css: ['src/app.css'],
      static: { navigateFunctions: ['navigate'], placeholderConstantPattern: /PLACEHOLDER/ },
      notApplicable: [],
      baseline: 'krds-baseline.json',
      runtime: null,
    })
  })

  it('화면 설정에 기본값을 채우고 폭을 정렬·중복 제거한다', () => {
    const config = parse({
      ...MINIMAL,
      notApplicable: [...CONDITION_RULES, ...SEARCH_RULES],
      runtime: runtime({
        viewports: [1280, 360, 1280],
        routes: [{ path: '/' }, { path: '/pop', popup: true }],
      }),
    })

    expect(config.runtime).toEqual({
      routes: [
        { path: '/', popup: false },
        { path: '/pop', popup: true },
      ],
      viewports: [360, 1280],
      scenarioViewport: 1280,
      height: 900,
      maxTabStops: 200,
      selectors: SELECTORS,
      scenarios: { search: null, searchWithConditions: null },
    })
  })

  it('notApplicable을 정렬한다', () => {
    expect(
      parse({ ...MINIMAL, notApplicable: ['krds/no-hash-href', 'krds/contrast'] }).notApplicable,
    ).toEqual(['krds/contrast', 'krds/no-hash-href'])
  })

  it('placeholderConstantPattern 문자열을 정규식으로 만든다', () => {
    expect(parse({ ...MINIMAL, static: { placeholderConstantPattern: '^HINT_' } }).static).toEqual({
      navigateFunctions: ['navigate'],
      placeholderConstantPattern: /^HINT_/,
    })
  })

  it('시나리오 단계를 그대로 싣는다', () => {
    const search = {
      steps: [
        { action: 'goto', path: '/' },
        { action: 'fill', selector: '#q', value: '주차' },
        { action: 'press', key: 'Enter' },
        { action: 'waitFor', selector: '#results' },
      ],
      input: '#q',
      query: '주차',
      resultCount: '#count',
    }

    expect(
      parse({
        ...MINIMAL,
        notApplicable: CONDITION_RULES,
        runtime: runtime({ scenarios: { search } }),
      }).runtime?.scenarios.search,
    ).toEqual(search)
  })

  it('JSON이 아니거나 객체가 아니면 최상위 오류다', () => {
    expect(() => parseConfig('{')).toThrow(ConfigError)
    expect(errorPath([])).toBe('')
  })

  it.each([
    [{ ...MINIMAL, nmae: 'x' }, 'nmae'],
    [{ sources: [], css: [] }, 'name'],
    [{ ...MINIMAL, sources: 'src' }, 'sources'],
    [{ ...MINIMAL, css: ['a.css', 1] }, 'css[1]'],
    [
      { ...MINIMAL, static: { placeholderConstantPattern: '(' } },
      'static.placeholderConstantPattern',
    ],
    [{ ...MINIMAL, notApplicable: ['krds/nope'] }, 'notApplicable[0]'],
    [{ ...MINIMAL, runtime: runtime({ viewports: [360, 0] }) }, 'runtime.viewports[1]'],
    [
      { ...MINIMAL, runtime: runtime({ viewports: [360], scenarioViewport: 1280 }) },
      'runtime.scenarioViewport',
    ],
    [
      { ...MINIMAL, runtime: runtime({ routes: [{ path: 'no-slash' }] }) },
      'runtime.routes[0].path',
    ],
    [
      { ...MINIMAL, runtime: runtime({ selectors: { ...SELECTORS, banner: '' } }) },
      'runtime.selectors.banner',
    ],
    [
      {
        ...MINIMAL,
        notApplicable: CONDITION_RULES,
        runtime: runtime({
          scenarios: {
            search: {
              steps: [{ action: 'hover', selector: 'a' }],
              input: '#q',
              query: 'q',
              resultCount: '#c',
            },
          },
        }),
      },
      'runtime.scenarios.search.steps[0].action',
    ],
  ])('틀린 자리를 path로 알린다 (%#)', (value, path) => {
    expect(errorPath(value)).toBe(path)
  })

  it('검색 시나리오가 없는데 그것에 기대는 규칙이 해당 없음에 없으면 던진다', () => {
    expect(errorPath({ ...MINIMAL, notApplicable: CONDITION_RULES, runtime: runtime() })).toBe(
      'runtime.scenarios.search',
    )
    expect(errorPath({ ...MINIMAL, notApplicable: SEARCH_RULES, runtime: runtime() })).toBe(
      'runtime.scenarios.searchWithConditions',
    )
  })

  it('runtime이 없으면 시나리오 규칙을 따지지 않는다 — 화면 검사를 안 돌리니 not-run이다', () => {
    expect(parse(MINIMAL).runtime).toBeNull()
  })
})
