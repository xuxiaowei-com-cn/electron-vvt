import { app, Menu, shell } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import { readFile } from 'fs/promises'

import { update } from './updater.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const packagePath = path.join(__dirname, 'package.json')
const packageJson = JSON.parse(await readFile(packagePath, { encoding: 'utf8' }))

app.whenReady().then(() => {
  // 获取默认菜单
  const applicationMenu = Menu.getApplicationMenu()

  // 深度克隆菜单结构的工具函数
  const convertMenuItem = (menuItem) => {
    return {
      role: menuItem.role,
      submenu: menuItem.submenu ? menuItem.submenu.items.map(convertMenuItem) : [],
      type: menuItem.type,
      accelerator: menuItem.accelerator,
      icon: menuItem.icon,
      label: menuItem.label,
      sublabel: menuItem.sublabel,
      toolTip: menuItem.toolTip,
      enabled: menuItem.enabled,
      visible: menuItem.visible,
      checked: menuItem.checked,
      acceleratorWorksWhenHidden: menuItem.acceleratorWorksWhenHidden,
      registerAccelerator: menuItem.registerAccelerator,
      commandId: menuItem.commandId,
      click: menuItem.click,
      menu: menuItem.menu,
    }
  }

  // 克隆原有菜单结构（支持嵌套）
  const newTemplate = applicationMenu.items.map(convertMenuItem)

  // 查找 Mac 系统的 appmenu 菜单
  const appmenuMenu = newTemplate.find((item) => item.role === 'appmenu')
  const aboutIndex = appmenuMenu?.submenu.findIndex((item) => item.role === 'about')
  if (aboutIndex !== -1) {
    // 在 Mac 系统 about 菜单项之后插入 检查并更新菜单
    appmenuMenu?.submenu.splice(aboutIndex + 1, 0, {
      label: 'Check for Updates',
      click: function () {
        update()
      },
    })
  }

  // 查找 help 菜单
  const helpMenu = newTemplate.find((item) => item.role === 'help')

  if (helpMenu) {
    // 初始化 submenu 数组（如果不存在）
    helpMenu.submenu = helpMenu.submenu || []

    // 添加新子菜单项（追加到末尾）
    helpMenu.submenu.push(
      { type: 'separator' },
      {
        label: 'GitHub',
        click: () => {
          shell.openExternal(packageJson.homepage).then((_) => {})
        },
      },
      {
        label: 'Issues',
        click: () => {
          shell.openExternal(packageJson.bugs.url).then((_) => {})
        },
      },
    )
  } else {
    // 如果不存在 Help 菜单则创建（可选）
    newTemplate.push({
      label: 'Help',
      submenu: [
        {
          label: 'GitHub',
          click: () => {
            shell.openExternal(packageJson.homepage).then((_) => {})
          },
        },
        {
          label: 'Issues',
          click: () => {
            shell.openExternal(packageJson.bugs.url).then((_) => {})
          },
        },
      ],
    })
  }

  // 重新构建菜单
  const updatedMenu = Menu.buildFromTemplate(newTemplate)
  Menu.setApplicationMenu(updatedMenu)
})
