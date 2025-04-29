import { app, session } from 'electron'
import log from 'electron-log'
import Store from 'electron-store'

const store = new Store()

const logSession = log.create({ logId: 'session' })
logSession.transports.file.fileName = 'session.log'
logSession.scope.defaultLabel = 'session'
logSession.scope.labelPadding = 8

let userAgent = store.get('userAgent')

const config = [
  {
    urls: ['*://gitlab.xuxiaowei.com.cn/*'],
    'access-control-allow-origin': ['http://localhost:5173'],
    'access-control-allow-headers': ['private-token'],
    'access-control-allow-methods': ['PUT'],
  },
]

app.whenReady().then(() => {
  config.forEach((item) => {
    session.defaultSession.webRequest.onBeforeSendHeaders(
      { urls: item.urls },
      (details, callback) => {
        const url = new URL(details.url)
        details.requestHeaders.Origin = url.origin
        details.requestHeaders.referrer = url.origin
        details.requestHeaders['User-Agent'] = userAgent
        callback({ requestHeaders: details.requestHeaders })
      },
    )

    session.defaultSession.webRequest.onHeadersReceived(
      { urls: item.urls },
      (details, callback) => {
        details.responseHeaders['access-control-allow-origin'] = item['access-control-allow-origin']
        details.responseHeaders['access-control-allow-headers'] =
          item['access-control-allow-headers']
        details.responseHeaders['access-control-allow-methods'] =
          item['access-control-allow-methods']
        callback({ responseHeaders: details.responseHeaders })
      },
    )
  })
})
