import whistle from 'whistle'
import path from 'path'
import { DATA_PATH } from '../const'

export function startProxyServer() {
  whistle(
    {
      rules: {
        "*": "* aoko://"
      },
      pluginsPath: path.resolve('./dist/plugin'),
      dataDirname: DATA_PATH,
    },
    (r) => {
      console.log(r?.getWhistlePath())
    }
  )
}
