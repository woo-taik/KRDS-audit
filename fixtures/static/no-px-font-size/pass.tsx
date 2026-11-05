declare function cn(...inputs: unknown[]): string

export function Body() {
  return (
    <p className={cn('text-sm leading-[18px] md:text-[0.9375rem]', 'text-[var(--size)]')}>
      <span className="text-[#333] tracking-[0.5px]">본문</span>
    </p>
  )
}

// 클래스로 쓰이지 않는 문자열은 보지 않는다.
const MESSAGE = 'text-[11px]은 쓰지 마세요'

export function Note() {
  return <p title={MESSAGE}>안내</p>
}
