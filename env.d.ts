/// <reference types="vite/client" />

// 扩展 Window 类型定义
interface Window {
  /**
   * Electron 暴露的 API
   * 需与 preload.ts 中的定义保持一致
   */
  LocalStorage: {
    /**
     *
     */
    setItem(key: string, value: string): void
    /**
     *
     */
    getItem(key: string): string | null
  }
}
