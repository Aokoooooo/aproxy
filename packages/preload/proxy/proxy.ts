import http from 'http'
import https from 'https'
import WebSocket from 'ws'
import { ProxyOptions } from './type'
import { ProxyHandler } from './proxy-handler'
import { getCA, CA } from './ca'

export class Proxy extends ProxyHandler {
  private isRunning = false
  private options: ProxyOptions = {}
  private ca: CA | null = null
  private httpServer: http.Server | null = null
  private wsServer: WebSocket.Server | null = null

  get getIsRunning() {
    return this.isRunning
  }
  async listen(options: ProxyOptions, cb: () => void) {
    if (this.isRunning) {
      this.close()
    }
    this.ca = await getCA()
    this.options.port = options.port ?? 8899
    this.options.host = options.host ?? 'localhost'
    this.options.timeout = options.timeout ?? 0
    this.options.keepAlive = options.keepAlive ?? false
    this.options.httpAgent = options.httpAgent ?? new http.Agent({ keepAlive: this.options.keepAlive })
    this.options.httpsAgent = options.httpsAgent ?? new https.Agent({ keepAlive: this.options.keepAlive })
    this.httpServer = http.createServer()
    this.httpServer.timeout = this.options.timeout
    this.wsServer = new WebSocket.Server({ server: this.httpServer })
    this.httpServer.listen(
      {
        host: this.options.host,
        port: this.options.port,
      },
      () => {
        this.isRunning = true
        cb()
      }
    )
    return this
  }
  close() {
    this.isRunning = false
    return this
  }
}
