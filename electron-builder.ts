import { Configuration } from 'electron-builder'

// 导出默认的配置对象，类型为 electron-builder 的 Configuration
export default <Configuration>{
  // 应用唯一标识，使用环境变量 npm_package_name 动态生成
  appId: `cn.com.xuxiaowei.${process.env.npm_package_name}`,
  // 版权信息，包含作者名和网站链接
  copyright: 'Copyright © 徐晓伟 https://xuxiaowei.com.cn',
  // 打包产物名称，使用模板字符串动态生成，包含产品名、版本、平台和架构
  artifactName: '${productName}-${version}-${platform}-${arch}.${ext}',
  // 使用 asar 打包，将所有文件打包成一个 asar 归档文件
  asar: true,
  // asar 打包后解压的文件（运行前会自动解压）
  asarUnpack: [],
  // 打包 删除 package.json 的 scripts
  removePackageScripts: true,
  // 打包 删除 package.json 的 keywords
  removePackageKeywords: true,
  // 是否从应用程序版本号推断更新通道。例如，如果版本为 0.12.1-alpha.1，则 channel 将被设置为 alpha。否则为 latest。
  detectUpdateChannel: true,
  // 是否在发布时自动生成更新文件。如果设置为 true，则会在发布时自动生成更新文件，否则需要手动生成。
  generateUpdatesFilesForAllChannels: true,
  // 打包的文件
  files: [
    // Vite 打包后的文件
    'dist/**/*',
    // 程序入口文件
    'main.js',
    // 菜单配置文件
    'menu.js',
    // 预加载文件
    'preload.js',
    // 更新配置文件
    'updater.js',
  ],
  // 生成资源的目录
  directories: {
    output: 'release/${version}',
  },
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['arm64', 'x64', 'universal'],
      },
      // 无论如何都要启用 zip，否则会影响 'dmg' 包中的自动更新
      {
        target: 'zip',
        arch: ['arm64', 'x64', 'universal'],
      },
    ],
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64', 'arm64'],
      },
    ],
  },
  nsis: {
    // 禁用一键安装
    oneClick: false,
    // 为所有用户安装
    perMachine: true,
    // 允许修改安装目录
    allowToChangeInstallationDirectory: true,
  },
}
