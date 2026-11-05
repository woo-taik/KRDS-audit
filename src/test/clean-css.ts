/** CSS 규칙을 모두 통과하는 대상 CSS. CLI 테스트에서 정적 위반만 남기려고 쓴다. */
export const CLEAN_CSS = [
  "@theme { --font-sans: 'Pretendard GOV', sans-serif; --text-base: 1.0625rem; }",
  '@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }',
  '@media (forced-colors: active) { a { color: LinkText; } }',
].join('\n')
