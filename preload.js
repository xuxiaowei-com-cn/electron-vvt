/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ipcRenderer, contextBridge } = require('electron')

console.log('preload.js')

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) {
      element.innerText = text
    }
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

contextBridge.exposeInMainWorld('LocalStorage', {
  setItem: (key, value) => ipcRenderer.sendSync('set-item', key, value),
  getItem: (key) => ipcRenderer.sendSync('get-item', key),
})
