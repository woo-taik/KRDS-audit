import { chromium, type Browser, type Page } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { uniqueSelector } from './unique-selector.js'

let browser: Browser
let page: Page

beforeAll(async () => {
  browser = await chromium.launch()
  page = await browser.newPage()
})

afterAll(async () => {
  await browser?.close()
})

const selectorOf = async (html: string, query: string) => {
  await page.setContent(html)
  const element = await page.$(query)
  if (!element) throw new Error(`${query}가 없다`)

  return uniqueSelector(element)
}

describe('uniqueSelector', () => {
  it('html은 :root, body는 body다', async () => {
    expect(await selectorOf('<p>x</p>', 'html')).toBe(':root')
    expect(await selectorOf('<p>x</p>', 'body')).toBe('body')
  })

  it('하나뿐인 id를 쓰고 특수 문자는 이스케이프한다', async () => {
    expect(await selectorOf('<p id="a">x</p>', 'p')).toBe('#a')
    expect(await selectorOf('<p id="1:b">x</p>', 'p')).toBe('#\\31 \\:b')
  })

  it('겹치는 id는 쓰지 않고 가장 가까운 고유 id 조상에서 nth-of-type으로 내려간다', async () => {
    const html = '<main id="m"><p id="d">a</p><div><span id="d">b</span><span>c</span></div></main>'

    expect(await selectorOf(html, 'div > span:nth-of-type(2)')).toBe(
      '#m > div:nth-of-type(1) > span:nth-of-type(2)',
    )
  })

  it('id 조상이 없으면 body에서 내려간다', async () => {
    expect(await selectorOf('<ul><li>a</li><li>b</li></ul>', 'li:nth-of-type(2)')).toBe(
      'body > ul:nth-of-type(1) > li:nth-of-type(2)',
    )
  })

  it('낸 셀렉터는 그 요소 하나만 가리킨다', async () => {
    await page.setContent('<section><a>1</a><a>2</a></section><section><a>3</a></section>')
    const anchors = await page.$$('a')

    for (const anchor of anchors) {
      const selector = await uniqueSelector(anchor)
      const matched = await page.$$(selector)

      expect(matched).toHaveLength(1)
      expect(await matched[0]?.evaluate((el, other) => el === other, anchor)).toBe(true)
    }
  })
})
