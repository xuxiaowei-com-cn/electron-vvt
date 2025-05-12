import { app, session } from 'electron'
import log from 'electron-log'
import Store from 'electron-store'

const store = new Store()
const sessionConfig = new Store({
  name: 'Session',
})

const logSession = log.create({ logId: 'session' })
logSession.transports.file.fileName = 'session.log'
logSession.scope.defaultLabel = 'session'
logSession.scope.labelPadding = 8

let userAgent = store.get('userAgent')

const webRequests = sessionConfig.get('webRequests') || []
sessionConfig.set('webRequests', webRequests)

// const webRequests = [
//   {
//     urls: ['*://gitlab.xuxiaowei.com.cn/*'],
//     'access-control-allow-headers': ['private-token'],
//     'access-control-allow-methods': ['PUT', 'DELETE'],
//   }
// ]

app.whenReady().then(() => {
  webRequests.forEach((item) => {
    session.defaultSession.webRequest.onBeforeSendHeaders(
      { urls: item.urls },
      (details, callback) => {
        const url = new URL(details.url)
        const requestHeaders = details.requestHeaders
        requestHeaders['Origin'] = url.origin
        requestHeaders['User-Agent'] = userAgent
        callback({ requestHeaders })
      },
    )

    session.defaultSession.webRequest.onHeadersReceived(
      { urls: item.urls },
      (details, callback) => {
        const responseHeaders = details.responseHeaders
        if (process.env.VITE_SERVER_URL) {
          responseHeaders['access-control-allow-origin'] = [process.env.VITE_SERVER_URL + '']
        } else {
          responseHeaders['access-control-allow-origin'] = null
        }
        responseHeaders['access-control-allow-headers'] = item['access-control-allow-headers']
        responseHeaders['access-control-allow-methods'] = item['access-control-allow-methods']
        callback({ responseHeaders })
      },
    )
  })
})
