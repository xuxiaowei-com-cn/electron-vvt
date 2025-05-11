import { ipcMain } from 'electron'
import Store from 'electron-store'

const localStorage = new Store({
  name: 'LocalStorage',
})

ipcMain.on('set-item', (event, key, value) => {
  localStorage.set(key, value)
  event.returnValue = true
})

ipcMain.on('get-item', (event, key) => {
  event.returnValue = localStorage.get(key)
})
