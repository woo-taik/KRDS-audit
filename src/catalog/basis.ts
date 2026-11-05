import type { Basis } from './types.js'

const KRDS = 'https://www.krds.go.kr/html/site'
const WCAG = 'https://www.w3.org/WAI/WCAG22/Understanding'

export const KRDS_COLOR: Basis = {
  doc: 'KRDS',
  ref: '스타일 — 색상',
  url: `${KRDS}/style/style_02.html`,
}
export const KRDS_TYPOGRAPHY: Basis = {
  doc: 'KRDS',
  ref: '스타일 — 타이포그래피',
  url: `${KRDS}/style/style_03.html`,
}
export const KRDS_BUTTON: Basis = {
  doc: 'KRDS',
  ref: '컴포넌트 — 버튼',
  url: `${KRDS}/component/component_05_02.html`,
}
export const KRDS_PRINCIPLES: Basis = {
  doc: 'KRDS',
  ref: '디자인 원칙 7 — 신뢰할 수 있는 서비스',
  url: `${KRDS}/utility/utility_02.html`,
}
export const KRDS_INCLUSION: Basis = {
  doc: 'KRDS',
  ref: '디지털 포용',
  url: `${KRDS}/utility/utility_04.html`,
}
export const KRDS_SEARCH: Basis = {
  doc: 'KRDS',
  ref: '서비스 패턴 — 검색',
  url: `${KRDS}/service/service_02_01.html`,
}

const wcag = (ref: string, slug: string): Basis => ({
  doc: 'WCAG',
  ref,
  url: `${WCAG}/${slug}.html`,
})

export const WCAG_CONTRAST = wcag('1.4.3 Contrast (Minimum)', 'contrast-minimum')
export const WCAG_RESIZE_TEXT = wcag('1.4.4 Resize Text', 'resize-text')
export const WCAG_NON_TEXT_CONTRAST = wcag('1.4.11 Non-text Contrast', 'non-text-contrast')
export const WCAG_BYPASS = wcag('2.4.1 Bypass Blocks', 'bypass-blocks')
export const WCAG_LINK_PURPOSE = wcag('2.4.4 Link Purpose (In Context)', 'link-purpose-in-context')
export const WCAG_FOCUS_VISIBLE = wcag('2.4.7 Focus Visible', 'focus-visible')
export const WCAG_ANIMATION = wcag(
  '2.3.3 Animation from Interactions',
  'animation-from-interactions',
)
export const WCAG_TARGET_MIN = wcag('2.5.8 Target Size (Minimum)', 'target-size-minimum')
export const WCAG_ON_INPUT = wcag('3.2.2 On Input', 'on-input')
export const WCAG_LABELS = wcag('3.3.2 Labels or Instructions', 'labels-or-instructions')
export const WCAG_NAME_ROLE = wcag('4.1.2 Name, Role, Value', 'name-role-value')
