// Modules to control application life and create native browser window

import { app, BrowserWindow, net, protocol } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import log from 'electron-log'
import Store from 'electron-store'
import fs from 'fs/promises'

import './ipc-main.js'
import './menu.js'
import './updater.js'
import './session.js'

const store = new Store()

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 日志文件名，默认日志位置：
// Windows 开发：C:\Users\%USERPROFILE%\AppData\Roaming\Electron\logs
// Windows 安装：C:\Users\%USERPROFILE%\AppData\Roaming\项目名称\logs
// macOS 开发：/Users/$USER/Library/Logs/Electron
// macOS 安装：/Users/$USER/Library/Logs/项目名称
// Linux 开发：~/.config/Electron/logs
// Linux 运行 *.AppImage：~/.config/项目名称/logs
// Linux 安装 *.deb：~/.config/项目名称/logs
// Linux 安装 *.snap：~/snap/项目名称/x1/.config/项目名称/logs
log.transports.file.fileName = 'main.log'
log.scope.defaultLabel = 'main'
log.scope.labelPadding = 8

log.info('Hello from Electron 👋')

// 创建一个新的日志记录器
const loader = log.create({ logId: 'loader' })
loader.transports.file.fileName = 'loader.log'
loader.scope.defaultLabel = 'loader'
loader.scope.labelPadding = 8

const devTools = store.get('devTools')
if (typeof devTools !== 'boolean') {
  store.set('devTools', process.env.NODE_ENV === 'development')
}

let userAgent = store.get('userAgent')

// Windows 开发：C:\Users\%USERPROFILE%\AppData\Roaming\Electron\config.json
// Windows 安装：C:\Users\%USERPROFILE%\AppData\Roaming\项目名称\config.json
// macOS 开发：/Users/$USER/Library/Application Support/Electron/config.json
// macOS 安装：/Users/$USER/Library/Application Support/项目名称/config.json
// Linux 开发：~/.config/Electron/config.json
// Linux 运行 *.AppImage：~/.config/项目名/config.json
// Linux 安装 *.deb：~/.config/项目名/config.json
// Linux 安装 *.snap：~/snap/项目名/x1/.config/项目名/config.json
log.info('electron-store path', store.path)

// 协议名称，自定义
const scheme = 'vvt'

// 新增协议注册函数
const registerProtocol = () => {
  protocol.handle(scheme, async (request) => {
    const url = request.url
    const parsedUrl = url
      .substring(scheme.length + 3)
      .split('?')[0]
      .replace(/^(\.\.(\/|\\|$))+/, '')
    const requestedPath = path.join(__dirname, parsedUrl)
    const normalizedPath = path.normalize(requestedPath)

    try {
      await fs.access(normalizedPath, fs.constants.R_OK)
      loader.info(
        `url: ${url}, parsedUrl: ${parsedUrl}, requestedPath: ${requestedPath}, normalizedPath: ${normalizedPath}`,
      )
      return net.fetch(`file://${normalizedPath}`)
    } catch {
      const fallbackPath = path.join(__dirname, 'dist', 'index.html')
      loader.warn(
        `url: ${url}, parsedUrl: ${parsedUrl}, requestedPath: ${requestedPath}, fallbackPath: ${fallbackPath}`,
      )
      return net.fetch(`file://${fallbackPath}`)
    }
  })
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: devTools,
    },
  })

  // 移除 默认的 UserAgent 中的 Electron 标识
  const webContents = mainWindow.webContents
  userAgent =
    userAgent == null ? webContents.getUserAgent().replace(/ Electron\/[\d.]+/g, '') : userAgent
  store.set('userAgent', userAgent)
  webContents.setUserAgent(userAgent)

  if (process.env.VITE_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_SERVER_URL).catch((err) => {
      log.error('mainWindow.loadURL', process.env.VITE_SERVER_URL, err)
    })

    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  } else {
    // and load the index.html of the app.
    mainWindow.loadURL(`${scheme}://dist/index.html`).catch((err) => {
      log.error('mainWindow.loadURL', err)
    })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // 只在生产环境注册协议
  if (!process.env.VITE_SERVER_URL) {
    registerProtocol()
  }

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
