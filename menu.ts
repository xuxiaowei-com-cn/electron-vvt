import { app, Menu, MenuItem, shell } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import { readFile } from 'fs/promises'

import { update } from './updater.ts'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const packagePath = path.join(__dirname, 'package.json')
const packageJson = JSON.parse(await readFile(packagePath, { encoding: 'utf8' }))

console.log(packageJson.homepage)
console.log(packageJson.bugs.url)

app.whenReady().then(() => {
  const applicationMenu = Menu.getApplicationMenu()

  if (applicationMenu) {
    // Mac: 在 About 下方新增 Check for Updates
    if (process.platform === 'darwin') {
      const appMenu = applicationMenu.items[0]?.submenu
      if (appMenu) {
        const aboutIndex = appMenu.items.findIndex(item => item.role === 'about')
        if (aboutIndex >= 0) {
          appMenu.insert(aboutIndex + 1, new MenuItem({
            label: 'Check for Updates',
            click: () => update()
          }))
        }
      }
    }

    // 新增 Help 菜单
    const helpMenu = applicationMenu.items.find(item => item.role === 'help')
    if (helpMenu?.submenu) {
      helpMenu.submenu.append(new MenuItem({ type: 'separator' }))
      helpMenu.submenu.append(new MenuItem({
        label: 'Homepage',
        click: () => shell.openExternal(packageJson.homepage)
      }))
      helpMenu.submenu.append(new MenuItem({
        label: 'Report Issue',
        click: () => shell.openExternal(packageJson.bugs.url)
      }))
    } else {
      applicationMenu.append(new MenuItem({
        role: 'help',
        submenu: [
          {
            label: 'Homepage',
            click: () => shell.openExternal(packageJson.homepage)
          },
          {
            label: 'Report Issue',
            click: () => shell.openExternal(packageJson.bugs.url)
          }
        ]
      }))
    }
  }

  Menu.setApplicationMenu(applicationMenu)
})
