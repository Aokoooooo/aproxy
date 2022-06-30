import whistle from 'whistle'

export function startProxyServer() {
  whistle({}, (r) => {
    console.log(r)
  })
}
