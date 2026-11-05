import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join, normalize } from 'node:path'

export type FixtureServer = {
  baseUrl: string
  close: () => Promise<void>
}

/** 폴더 하나를 사이트로 띄운다. `/` → index.html, `/a` → a.html, 쿼리는 무시한다. 없으면 404. */
export async function serveFixture(dir: string): Promise<FixtureServer> {
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://fixture').pathname
    const name = pathname === '/' ? 'index' : pathname.slice(1)
    const file = normalize(join(dir, `${name}.html`))

    if (!file.startsWith(normalize(dir))) {
      response.writeHead(400).end()
      return
    }

    try {
      const body = await readFile(file)
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(body)
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain' }).end('not found')
    }
  })

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => server.close((e) => (e ? reject(e) : resolve()))),
  }
}
