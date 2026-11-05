/**
 * 페이지 안에서 도는 도우미. TS 함수를 넘기면 번들러가 끼운 도우미(`__name` 등)가 페이지에 없어 깨지므로
 * 손으로 쓴 JS 문자열로 둔다. `window.__krds`에 한 번만 건다.
 */
export const PAGE_HELPERS = `
window.__krds = window.__krds || (() => {
  const selector = (node) => {
    if (node === document.documentElement) return ':root'
    if (node === document.body) return 'body'
    if (node.id && document.querySelectorAll('#' + CSS.escape(node.id)).length === 1) {
      return '#' + CSS.escape(node.id)
    }
    const parent = node.parentElement
    const tag = node.tagName.toLowerCase()
    if (!parent) return tag
    let index = 1
    for (let sibling = node.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
      if (sibling.tagName === node.tagName) index++
    }
    return selector(parent) + ' > ' + tag + ':nth-of-type(' + index + ')'
  }

  const visible = (element) => {
    const style = getComputedStyle(element)
    if (style.visibility === 'hidden' || style.display === 'none') return false
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }

  return { selector, visible }
})()
`
