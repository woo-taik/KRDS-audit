export function Feedback() {
  return (
    <form>
      <input /* ✗ */ aria-label="이름" />
      <textarea /* ✗ */ aria-label="의견" rows={4} />
      <label htmlFor="phone">전화</label>
      <input /* ✗ */ id="email" aria-label="이메일" />
    </form>
  )
}
