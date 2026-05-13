# Electron + Vue 3 + Vite + TypeScript

基于 Electron、Vue 3、Vite、TypeScript 的桌面应用启动模板。

## 技术栈

- **Electron** - 桌面应用框架
- **Vue 3** - Composition API + `<script setup>`
- **Vite** - 构建工具
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **Vue Router** - 路由管理（Hash 模式）
- **electron-log** - 日志记录
- **electron-store** - 持久化存储
- **electron-updater** - 自动更新
- **electron-builder** - 打包分发

## 快速开始

```bash
# 安装依赖（选择其一）
npm run pre:npm
npm run pre:yarn
npm run pre:pnpm

# 启动开发服务器（自动打开 Electron 窗口）
npm run dev

# 类型检查
npm run type-check

# 构建 + 打包
npm run build

# 仅构建前端
npm run build-only

# 构建并发布（自动更新通道）
npm run build:publish
```

## 特性

- **自定义 Vite 插件** (`vite.electron-plugin.ts`)：管理 Electron 主进程生命周期，支持 HMR
- **自定义协议**：生产环境使用 `vvt://` 自定义协议加载资源，提升安全性
- **自动更新**：集成 `electron-updater`，启动时自动检查更新，菜单栏支持手动触发
- **日志系统**：主进程、加载器、更新器分别记录独立日志文件
- **菜单扩展**：自动添加 GitHub/Issues 链接、macOS 检查更新菜单项
- **UserAgent 处理**：自动移除默认 UA 中的 Electron 标识
- **DevTools 控制**：通过 `electron-store` 持久化 DevTools 开关状态

## 目录结构

```
electron-vvt/
├── .github/
│   ├── workflows/
│   │   ├── node.js.yml              # Node.js CI
│   │   └── npm-publish.yml          # npm 发布
│   └── dependabot.yml               # 依赖自动更新
├── public/
│   ├── favicon.svg                  # 网站图标
│   └── icons.svg                    # SVG 图标集
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── vite.svg
│   │   └── vue.svg
│   ├── components/
│   │   └── HelloWorld.vue           # 示例组件（使用 Pinia）
│   ├── router/
│   │   └── index.ts                 # Vue Router 配置
│   ├── stores/
│   │   └── counter.ts               # Pinia 状态管理示例
│   ├── views/
│   │   ├── HomeView.vue             # 首页
│   │   └── AboutView.vue            # 关于页（演示跨页面状态共享）
│   ├── App.vue                      # 根组件（含导航）
│   ├── main.ts                      # 应用入口
│   └── style.css                    # 全局样式
├── index.html                       # HTML 入口
├── main.js                          # Electron 主进程
├── menu.js                          # Electron 菜单配置
├── preload.js                       # Electron 预加载脚本
├── renderer.js                      # 渲染进程独立脚本
├── updater.js                       # 自动更新逻辑
├── electron-builder.ts              # Electron Builder 配置
├── vite.config.ts                   # Vite 配置
├── vite.electron-plugin.ts          # Vite Electron 插件
├── tsconfig.json                    # TypeScript 配置（引用）
├── tsconfig.app.json                # 应用 TypeScript 配置
├── tsconfig.node.json               # Node 端 TypeScript 配置
├── .npmrc                           # npm 镜像配置
├── .gitignore
├── LICENSE
└── package.json
```

## 打包配置

`electron-builder.ts` 支持以下平台：

- **macOS**: DMG + ZIP（arm64 / x64 / universal）
- **Linux**: AppImage（x64 / arm64）
- **Windows**: NSIS 安装包（可选择安装目录）

打包产物输出至 `release/${version}/` 目录，使用 asar 归档，自动生成更新通道文件。

## 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
