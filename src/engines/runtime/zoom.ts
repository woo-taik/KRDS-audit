import type { Page } from 'playwright'
import type { RuntimeConfig } from '../../config/types.js'

/** 단계를 찾을 때 한쪽으로 누르는 최대 횟수 — 끝이 없는 컨트롤에서 멈추려고. */
const MAX_PRESSES = 20

export const rootFontSize = (page: Page) =>
  page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))

/** 컨트롤이 보이고 눌리면 한 번 누르고 true. 없거나 비활성이면 false. */
export async function press(page: Page, selector: string): Promise<boolean> {
  const control = page.locator(selector).first()
  if (!(await control.isVisible()) || !(await control.isEnabled())) return false

  await control.click()
  return true
}

/** 가장 작게부터 가장 크게까지 오갈 수 있는 서로 다른 루트 글자 크기(px). */
export async function zoomSteps(page: Page, config: RuntimeConfig): Promise<number[]> {
  const { zoomIn, zoomOut } = config.selectors

  for (let i = 0; i < MAX_PRESSES; i++) {
    const before = await rootFontSize(page)
    if (!(await press(page, zoomOut)) || (await rootFontSize(page)) === before) break
  }

  const steps = [await rootFontSize(page)]
  for (let i = 0; i < MAX_PRESSES; i++) {
    if (!(await press(page, zoomIn))) break
    const size = await rootFontSize(page)
    if (steps.includes(size)) break
    steps.push(size)
  }

  return steps
}
