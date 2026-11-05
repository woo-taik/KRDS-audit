declare function cn(...inputs: unknown[]): string

export function Quiet({ busy }: { busy: boolean }) {
  return (
    <div>
      <span className="transition-colors hover:text-blue-700">색만 바뀐다</span>
      <span className="transition-opacity transition-shadow">투명도·그림자</span>
      <span className="transition-[color,background-color] duration-150">임의 색 속성</span>
      <span className="transition-[color,--tw-gradient-from]">사용자 정의 속성</span>
      <span className="transition-transform motion-reduce:transition-none">받았다</span>
      <span className={cn(busy && 'animate-spin', 'motion-reduce:animate-none')}>받았다</span>
      <span className="motion-safe:animate-pulse">설정을 존중한다</span>
      <span className="transition-none animate-none">멈춤</span>
    </div>
  )
}
