export function Tiny() {
  return (
    <div>
      <span className="text-[10px]">작은 글</span> {/* ✗ */}
      <span className="text-[0.7rem]">rem 작은 글</span> {/* ✗ */}
      <span className="hover:text-2xs">테마 작은 글</span> {/* ✗ */}
    </div>
  )
}
