import {
  ConnectCallback,
  ErrorCallback,
  ProxyContext,
  RequestCallback,
  WebSocketCallback,
  WebSocketContext,
} from './type'

export class ProxyHandler {
  protected onErrorHandlers: ErrorCallback[] = []
  protected onConnectHandlers: ConnectCallback[] = []

  protected onRequestHeadersHandlers = []
  protected onRequestHandlers: RequestCallback[] = []
  protected onRequestDataHandlers: RequestCallback[] = []
  protected onRequestEndHandlers: RequestCallback[] = []

  protected onResponseHeadersHandlers = []
  protected onResponseHandlers: RequestCallback[] = []
  protected onResponseDataHandlers: RequestCallback[] = []
  protected onResponseEndHandlers: RequestCallback[] = []

  protected onWebSocketConnectionHandlers: WebSocketCallback[] = []
  protected onWebSocketFrameHandlers: WebSocketCallback[] = []
  protected onWebSocketCloseHandlers: WebSocketCallback[] = []
  protected onWebSocketErrorHandlers: ErrorCallback[] = []

  onError(cb: ErrorCallback) {
    this.onErrorHandlers.push(cb)
    return this
  }
  protected async _onError(ctx: ProxyContext, e?: Error) {
    try {
      for (const handler of this.onErrorHandlers) {
        await handler(ctx, e)
      }
    } catch (e) {}
  }
  onConnect(cb: ConnectCallback) {
    this.onConnectHandlers.push(cb)
    return this
  }

  onRequest(cb: RequestCallback) {
    this.onRequestHandlers.push(cb)
    return this
  }
  onRequestData(cb: RequestCallback) {
    this.onRequestDataHandlers.push(cb)
    return this
  }
  onRequestEnd(cb: RequestCallback) {
    this.onRequestEndHandlers.push(cb)
    return this
  }

  onResponse(cb: RequestCallback) {
    this.onResponseHandlers.push(cb)
    return this
  }
  onResponseData(cb: RequestCallback) {
    this.onResponseDataHandlers.push(cb)
    return this
  }
  onResponseEnd(cb: RequestCallback) {
    this.onResponseEndHandlers.push(cb)
    return this
  }

  onWebSocketConnection(cb: WebSocketCallback) {
    this.onWebSocketConnectionHandlers.push(cb)
    return this
  }
  onWebSocketFrame(cb: WebSocketCallback) {
    this.onWebSocketFrameHandlers.push(cb)
    return this
  }
  onWebSocketClose(cb: WebSocketCallback) {
    this.onWebSocketCloseHandlers.push(cb)
    return this
  }
  onWebSocketError(cb: ErrorCallback) {
    this.onWebSocketErrorHandlers.push(cb)
    return this
  }
  protected async _onWsErr(ctx: WebSocketContext, e?: Error) {
    for (const handler of this.onWebSocketErrorHandlers) {
      await handler(ctx, e)
    }
  }
}
