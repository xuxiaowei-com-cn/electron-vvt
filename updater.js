import { app } from 'electron'
import log from 'electron-log'
import electronUpdater from 'electron-updater'

const logUpdater = log.create({ logId: 'updater' })
logUpdater.transports.file.fileName = 'updater.log'
logUpdater.scope.defaultLabel = 'updater'
logUpdater.scope.labelPadding = 8

const { autoUpdater } = electronUpdater

app.on('ready', function () {
  logUpdater.info('App is ready')

  // 使用 electron-log 的日志接管 autoUpdater 的日志
  autoUpdater.logger = logUpdater

  // 强制开发中检查更新（需要在项目根目录中添加 dev-app-update.yml 文件，可参考打包安装后安装目录下的 app-update.yml 并做相应的修改，用于指定开发中检查更新的配置）
  // autoUpdater.forceDevUpdateConfig = true

  if (autoUpdater.forceDevUpdateConfig !== true) {
    // 未强制开启检查更新

    if (process.env.NODE_ENV === 'development') {
      // 开发环境、未强制开启检查更新，则不执行以下代码，直接结束
      return
    }
    if (process.env.NODE_ENV === 'preview') {
      // 预览环境、未强制开启检查更新，则不执行以下代码，直接结束
      return
    }
  }

  // 检查更新：启动程序后立即执行
  autoUpdater.checkForUpdates().then((updateCheckResult) => {
    logUpdater.info('UpdateCheckResult.updateInfo:\n', updateCheckResult.updateInfo)
  })
})

export const update = function () {
  electronUpdater.autoUpdater.checkForUpdates().then((resp) => {
    logUpdater.info('手动触发更新菜单结果', resp)
  })
}
