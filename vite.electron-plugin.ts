import type { ConfigEnv, Plugin, PreviewServer, UserConfig, ViteDevServer } from 'vite'
import { type ChildProcess, spawn } from 'child_process'
import electron from 'electron'
import path from 'path'
import fs from 'fs-extra'

export interface ElectronCopyOptions {
  /**
   * 源文件路径
   */
  source: string

  /**
   * 目标文件路径
   */
  target: string
}

export interface ElectronPluginOptions {
  /**
   * Electron 主进程入口文件路径
   * @default 'main.js'
   */
  entry?: string

  /**
   * Electron 复制文件配置
   */
  copy?: ElectronCopyOptions[]
}

export default function electronPlugin(options: ElectronPluginOptions = {}): Plugin {
  return {
    name: 'vite-electron-plugin',
    apply: function (_config: UserConfig, env: ConfigEnv) {
      return env.command === 'serve' || env.command === 'build'
    },
    closeBundle() {
      options.copy?.forEach((item) => {
        const sourceDir = path.resolve(__dirname, item.source)
        const destDir = path.resolve(__dirname, item.target)
        fs.copy(sourceDir, destDir, (err) => {
          if (err) {
            console.error('copy error:', err)
            throw err
          }
          console.log('copy success:', destDir)
        })
      })
    },
    configureServer(server: ViteDevServer) {
      electronServer(options, server, false)
    },
    configurePreviewServer(server: PreviewServer) {
      electronServer(options, server, true)
    },
  }
}

function electronServer(
  options: ElectronPluginOptions = {},
  server: ViteDevServer | PreviewServer,
  _isPreview: boolean,
) {
  const { entry = 'main.js' } = options
  let electronProcess: ChildProcess | null = null

  const electronCmd = electron.toString()

  const startElectron = () => {
    // 在服务器实际监听后再设置 VITE_SERVER_URL，避免端口被占用时取到错误的端口
    const httpServer = server.httpServer
    if (httpServer) {
      const address = httpServer.address()
      if (address && typeof address === 'object') {
        process.env.VITE_SERVER_URL =
          server.resolvedUrls?.local[0] ||
          server.resolvedUrls?.network[0] ||
          `http://localhost:${address.port}`
      }
    }
    console.log('process.env.VITE_SERVER_URL:', process.env.VITE_SERVER_URL)

    if (electronProcess) {
      electronProcess.removeAllListeners()
      electronProcess.kill('SIGINT')
    }

    electronProcess = spawn(electronCmd, [entry], {
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    })

    electronProcess.on('exit', () => {
      server.close().then(_data => {
        console.log(`server closed`)
      }).catch(error => {
        console.error(error)
      })
    })
  }

  server.httpServer?.once('listening', () => {
    startElectron()
  })

  server.httpServer?.on('close', () => {
    electronProcess?.kill()
  })

  const interval = setInterval(async function () {
    if (electronProcess?.exitCode === null || electronProcess?.exitCode === undefined) {
      // 开发模式 正常运行
    } else {
      if (electronProcess?.exitCode === 0) {
        console.log(`electron exit success: ${electronProcess?.exitCode}`)
      } else if (electronProcess?.exitCode === 1) {
        console.log(`electron exit: ${electronProcess?.exitCode}`)
      } else {
        console.error(`electron exit error: ${electronProcess?.exitCode}`)
      }

      // 取消延时
      clearInterval(interval)

      // 关闭 vite
      await server
        .close()
        .then(() => {
          console.log(`vite close success`)
        })
        .catch((reason) => {
          console.error(`vite close error`, reason)
        })
        .finally(() => {
          console.log(`vite close finally`)
          process.exit(0)
        })
    }
  }, 1_000)
}
