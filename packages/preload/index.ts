import { domReady } from './utils'
import { useLoading } from './loading'
import { startProxyServer } from './proxy'

startProxyServer()

const { appendLoading, removeLoading } = useLoading()

window.removeLoading = removeLoading

domReady().then(appendLoading)
