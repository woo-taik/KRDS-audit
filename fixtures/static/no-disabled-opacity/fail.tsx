const BUTTON_CLASS = 'rounded-md px-4 disabled:cursor-not-allowed disabled:opacity-40' // ✗

export function Buttons() {
  return (
    <div>
      <button className={BUTTON_CLASS}>저장</button>
      <button className="aria-disabled:opacity-50">보내기</button> {/* ✗ */}
      <label className="group">
        <input type="checkbox" disabled />
        <span className="group-disabled:opacity-60 md:peer-disabled:opacity-30">동의</span> {/* ✗✗ */}
      </label>
    </div>
  )
}
