declare function cn(...inputs: unknown[]): string

export function NewBadge() {
  return <span className="rounded px-1 text-[11px] font-bold">새 글</span> /* ✗ */
}

export function SectionTitle({ big }: { big: boolean }) {
  return (
    <h2
      className={cn(
        'font-bold',
        big && 'md:text-[28px]', // ✗
      )}
    >
      제목
    </h2>
  )
}

const LABEL_CLASS = 'text-[length:14px] text-gray-700' // ✗

export function FieldLabel() {
  return <label className={LABEL_CLASS}>이름</label>
}

export function Price() {
  return <strong className="text-[22px]! max-md:text-[18.5px]">1,000원</strong> /* ✗✗ */
}
