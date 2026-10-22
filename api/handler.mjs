import { handleApi } from '../api-handler.mjs'

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const rewrittenPath = url.searchParams.get('path')
    const pathname = rewrittenPath
      ? `/api/${rewrittenPath.replace(/^\\/+/, '')}`
      : url.pathname
    const chunks = Buffer.from(await request.arrayBuffer())
    const req = {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      socket: { encrypted: url.protocol === 'https:' },
      async *[Symbol.asyncIterator]() {
        if (chunks.length) yield chunks
      },
    }
    let status = 200
    const headers = new Headers()
    let responseBody = ''
    const res = {
      setHeader(name, value) { headers.set(name, value) },
      writeHead(code, values = {}) {
        status = code
        for (const [name, value] of Object.entries(values)) headers.set(name, value)
      },
      end(value = '') { responseBody = value },
    }

    await handleApi(req, res, pathname)
    return new Response(responseBody, { status, headers })
  },
}
