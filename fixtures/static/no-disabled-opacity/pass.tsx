export function Buttons() {
  return (
    <div>
      <button className="disabled:bg-gray-100 disabled:text-gray-500">저장</button>
      <span className="opacity-50">흐린 장식</span>
      <a className="hover:opacity-80" href="/help">
        도움말
      </a>
    </div>
  )
}
