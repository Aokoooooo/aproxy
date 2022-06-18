import createProxy from 'http-mitm-proxy'
import { Connection, getConnection } from './connection'
import { HOME_PATH } from './const'

const proxy = createProxy()
let isRunning = false

export const startProxyServer = async (port = 8899) => {
  if (isRunning) {
    proxy.close()
    isRunning = false
  }

  proxy.onError((ctx, err, errKind) => {
    console.log(`${errKind} on '${ctx?.clientToProxyRequest?.url ?? 'unknown'}': `, err)
  })
  proxy.onRequest((ctx, cb) => {
    const connection = new Connection()
    ctx.tags = {
      id: connection.id,
    }
    const chunks: Buffer[] = []

    ctx.onRequestData((_, chunk, cb) => {
      chunks.push(chunk)
      return cb(undefined, chunk)
    })
    ctx.onRequestEnd((ctx, cb) => {
      try {
        connection.updateRequest({
          req: ctx.clientToProxyRequest,
          isSSL: ctx.isSSL,
          chunks,
        })
        return cb()
      } catch (e) {
        return cb(e as Error)
      }
    })
    return cb()
  })
  proxy.onResponse((ctx, cb) => {
    const connection = getConnection(ctx.tags.id)
    if (!connection) {
      return cb(new Error('aproxy connection not found'))
    }

    const chunks: Buffer[] = []
    ctx.onResponseData((_, chunk, cb) => {
      chunks.push(chunk)
      return cb(undefined, chunk)
    })
    ctx.onResponseEnd((ctx, cb) => {
      try {
        connection.updateResponse({
          res: ctx.serverToProxyResponse,
          chunks,
        })
        return cb()
      } catch (e) {
        return cb(e as Error)
      }
    })

    return cb()
  })
  proxy.listen({ port, sslCaDir: HOME_PATH }, () => {
    isRunning = true
    console.log(`proxy server start at ${port}`)
  })
}
