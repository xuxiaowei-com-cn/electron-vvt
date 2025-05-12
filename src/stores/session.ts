import { createPinia, defineStore } from 'pinia'
import { reactive } from 'vue'

export interface Session {
  id: number
  urls: string[]
  'access-control-allow-headers': string[]
  'access-control-allow-methods': string[]
}

export const useSessionWebRequestsStore = defineStore('session.webRequests', {
  state: () => ({
    configs: reactive([] as Session[]),
  }),
  getters: {
    getConfigs(): Session[] {
      return this.configs
    },
  },
  actions: {
    setConfig(session: Session) {
      this.configs.push(session)
    },
    clearConfig() {
      this.configs = []
    },
    // 添加删除配置的方法
    removeConfig(id: number) {
      const index = this.configs.findIndex((item) => item.id === id)
      if (index >= 0) {
        this.configs.splice(index, 1)
      }
    },
  },
})

const sessionWebRequestsStore = useSessionWebRequestsStore(createPinia())

// 订阅缓存的修改
sessionWebRequestsStore.$subscribe((mutation, state) => {
  // 将缓存的修改放入本地缓存中
  window.LocalStorage.setItem(sessionWebRequestsStore.$id, JSON.stringify({ ...state }))
})

// 获取历史缓存
const useStoreOld = window.LocalStorage.getItem(sessionWebRequestsStore.$id)
if (useStoreOld) {
  // 返回已存在的缓存
  sessionWebRequestsStore.$state = JSON.parse(useStoreOld)
}

export { sessionWebRequestsStore }
