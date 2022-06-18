import { v4 as uuid } from 'uuid'
import { IncomingHttpHeaders, IncomingMessage } from 'http'
import { HTTPEncodeType, isBinary, unpackBody } from './utils'

const connectionMap = new Map<string, Connection>()

export function getConnection(id: string) {
  return connectionMap.get(id)
}
export function getAllConnection() {
  return connectionMap.values()
}
export function insertConnection(c: Connection) {
  connectionMap.set(c.id, c)
}
export function deleteConnection(id: string) {
  connectionMap.delete(id)
}
export function clearConnection() {
  connectionMap.clear()
}

export class Connection {
  id: string
  originReq: IncomingMessage | null
  request: ConnectionRequest | null
  response: ConnectionResponse | null
  originRes: IncomingMessage | null

  constructor() {
    this.id = uuid()
    this.request = null
    this.originReq = null
    this.response = null
    this.originRes = null
    insertConnection(this)
  }

  updateRequest(data: { req: IncomingMessage; isSSL: boolean; chunks: Buffer[] }) {
    const { req, isSSL, chunks } = data
    if (!req.url) {
      throw new Error('no url')
    }
    if (!req.method) {
      throw new Error('no method')
    }
    if (!req.headers.host) {
      throw new Error('no host')
    }
    const protocol = isSSL ? 'https' : 'http'
    const host = req.headers.host
    this.request = {
      url: `${protocol}://${host}${req.url}`,
      method: req.method,
      headers: req.headers,
      body: chunks.length ? Buffer.concat(chunks).toString() : null,
    }
    this.originReq = req
  }

  async updateResponse(data: { res: IncomingMessage; chunks: Buffer[] }) {
    const { res, chunks } = data
    if (!res.statusCode) {
      throw new Error('no status code')
    }
    let body = null
    if (chunks.length) {
      let buffer = Buffer.concat(chunks)
      if (['gzip', 'deflate'].includes(res.headers?.['content-encoding'] ?? '')) {
        buffer = await unpackBody(buffer, res.headers['content-encoding'] as HTTPEncodeType)
      }
      body = isBinary(res.headers['content-type'] ?? '', buffer) ? buffer.toString('base64') : buffer.toString('utf8')
    }
    this.response = {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      headers: res.headers,
      rawHeaders: res.rawHeaders,
      body,
    }
    this.originRes = res
  }
}

export interface ConnectionRequest {
  url: string
  method: string
  headers: IncomingHttpHeaders
  body: string | null
}

export interface ConnectionResponse {
  statusCode: number
  statusMessage?: string
  headers: IncomingHttpHeaders
  rawHeaders: string[]
  body: string | null
}
