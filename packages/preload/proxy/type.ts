import http from 'http'
import https from 'https'
import net from 'net'

export interface ProxyOptions {
  port?: number
  host?: string
  sslCaDir?: string
  /**  - enable HTTP persistent connection*/
  keepAlive?: boolean
  /**  - The number of milliseconds of inactivity before a socket is presumed to have timed out. Defaults to no timeout. */
  timeout?: number
  /**  - The http.Agent to use when making http requests. Useful for chaining proxys. (default: internal Agent) */
  httpAgent?: http.Agent
  /** - The https.Agent to use when making https requests. Useful for chaining proxys. (default: internal Agent) */
  httpsAgent?: https.Agent
}

export type NextCallback<T = any> = (e?: Error) => T
export type ConnectCallback = (req: http.IncomingMessage, socket: net.Socket, next: NextCallback<void>) => any
export type ErrorCallback = (ctx: BasicContext, e?: Error) => any
export type RequestCallback = (ctx: RequestContext, next: NextCallback<void>) => any
export type WebSocketCallback = (ctx: WebSocketContext, next: NextCallback<void>) => any

export interface BasicContext {}
export interface RequestContext {}
export interface WebSocketContext {}
export type ProxyContext = BasicContext | RequestContext | WebSocketContext
