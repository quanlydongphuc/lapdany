import { createServer as createHttpServer } from 'node:http'
import { handleApi } from './api-handler.mjs'
import { createServer as createHttpsServer } from 'node:https'
import { createReadStream } from 'node:fs'
import { readFileSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 5175)
const httpsPort = Number(process.env.LOCAL_HTTPS_PORT || 5443)
const httpsKeyPath = process.env.LOCAL_HTTPS_KEY
const httpsCertPath = process.env.LOCAL_HTTPS_CERT

if (Boolean(httpsKeyPath) !== Boolean(httpsCertPath)) {
  throw new Error('Cần khai báo cả LOCAL_HTTPS_KEY và LOCAL_HTTPS_CERT trong .env.local để bật HTTPS.')
}
async function serveStatic(req, res, pathname) {
  const requested = path.resolve(root, 'dist', `.${decodeURIComponent(pathname)}`)
  let file = requested.startsWith(path.resolve(root, 'dist') + path.sep) ? requested : ''
  try {
    if (!file || !(await stat(file)).isFile()) file = path.join(root, 'dist', 'index.html')
  } catch { file = path.join(root, 'dist', 'index.html') }
  const contentType = file.endsWith('.js') ? 'text/javascript; charset=utf-8' : file.endsWith('.css') ? 'text/css; charset=utf-8' : file.endsWith('.svg') ? 'image/svg+xml' : 'text/html; charset=utf-8'
  res.writeHead(200, { 'Content-Type': contentType })
  createReadStream(file).pipe(res)
}

const production = process.env.NODE_ENV === 'production'
const vite = production ? null : await createViteServer({
  configFile: false,
  server: { middlewareMode: true },
  appType: 'spa',
})

const requestHandler = async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url.pathname)
  if (production) return serveStatic(req, res, url.pathname)
  vite.middlewares(req, res)
}

const server = createHttpServer(requestHandler)
const httpsServer = httpsKeyPath && httpsCertPath ? createHttpsServer({
  key: readFileSync(path.resolve(root, httpsKeyPath)),
  cert: readFileSync(path.resolve(root, httpsCertPath)),
}, requestHandler) : null

server.listen(port, '0.0.0.0', () => {
  console.log(`Voice to Thought đang chạy tại http://localhost:${port}`)
  if (httpsServer) console.log(`HTTPS nội bộ sẵn sàng tại https://<IP-máy-chủ>:${httpsPort}`)
  if (!process.env.OPENAI_API_KEY) console.log('Chưa cấu hình OPENAI_API_KEY; thêm khóa OpenAI vào .env.local để bật phân tích AI.')
})

httpsServer?.listen(httpsPort, '0.0.0.0')
