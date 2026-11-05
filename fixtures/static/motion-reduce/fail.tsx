declare function cn(...inputs: unknown[]): string

const PANEL_CLASS = {
  hero: 'rounded-xl transition-[height,padding] duration-150', // ✗
  compact: 'rounded-lg',
}

export function Panel({ variant, busy }: { variant: 'hero' | 'compact'; busy: boolean }) {
  return (
    <div className={PANEL_CLASS[variant]}>
      <span className="transition duration-200 hover:scale-105">카드</span> {/* ✗ */}
      <span className={cn('size-4', busy && 'animate-spin')}>●</span> {/* ✗ */}
      <span className="transition-all transition-transform">둘</span> {/* ✗✗ */}
    </div>
  )
}
