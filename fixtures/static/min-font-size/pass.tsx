export function Readable() {
  return (
    <div>
      <span className="text-xs">13px</span>
      <span className="text-[0.8125rem]">13px rem</span>
      <span className="text-[13px]">13px — px 고정은 다른 규칙이 잡는다</span>
      <span className="text-brand">글자 크기 아닌 text-*</span>
      <span className="text-[var(--size)]">모르는 값</span>
    </div>
  )
}
