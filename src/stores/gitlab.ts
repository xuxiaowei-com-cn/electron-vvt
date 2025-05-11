import { createPinia, defineStore } from 'pinia'
import { reactive } from 'vue'

export interface GitLab {
  domain: string
  token: string
}

export const useGitlabStore = defineStore('gitlab', {
  state: () => ({
    defaultDomain: '',
    configs: reactive([] as GitLab[]),
  }),
  getters: {
    getConfigs(): GitLab[] {
      return this.configs
    },
  },
  actions: {
    setDefaultDomain(domain: string) {
      this.defaultDomain = domain
    },
    setConfig(gitlab: GitLab) {
      try {
        // 标准化domain
        gitlab.domain = new URL(gitlab.domain.trim()).origin
        gitlab.token = gitlab.token.trim()

        // 检查是否已存在相同domain的配置
        const existingIndex = this.configs.findIndex((item) => item.domain === gitlab.domain)

        if (existingIndex >= 0) {
          // 如果已存在，则更新token
          this.configs[existingIndex].token = gitlab.token
        } else {
          // 如果不存在，则添加新配置
          this.configs.push(gitlab)
        }
      } catch (error) {
        console.error('Invalid GitLab URL:', error)
        throw new Error('Invalid GitLab URL provided')
      }
    },
    getConfig(domain: string): GitLab | undefined {
      if (!domain) {
        return undefined
      }
      try {
        const normalizedDomain = new URL(domain.trim()).origin
        return this.configs.find((item) => item.domain === normalizedDomain)
      } catch (error) {
        console.error('Invalid GitLab URL:', error)
        return undefined
      }
    },
    // 添加删除配置的方法
    removeConfig(domain: string) {
      const normalizedDomain = new URL(domain.trim()).origin
      const index = this.configs.findIndex((item) => item.domain === normalizedDomain)
      if (index >= 0) {
        this.configs.splice(index, 1)
      }
    },
  },
})

const gitlabStore = useGitlabStore(createPinia())

// 订阅缓存的修改
gitlabStore.$subscribe((mutation, state) => {
  // 将缓存的修改放入本地缓存中
  window.LocalStorage.setItem(gitlabStore.$id, JSON.stringify({ ...state }))
})

// 获取历史缓存
const useStoreOld = window.LocalStorage.getItem(gitlabStore.$id)
if (useStoreOld) {
  // 返回已存在的缓存
  gitlabStore.$state = JSON.parse(useStoreOld)
}

export { gitlabStore }
