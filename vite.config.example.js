/**
 * 用户项目的 vite.config.js 配置示例
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueIconfontPlugin from 'vue-iconfont-loader/vite';

export default defineConfig({
  plugins: [
    vue(),
    
    // Vue Iconfont Loader 插件
    // 在生产环境构建时自动下载 iconfont CSS 和字体文件
    VueIconfontPlugin({
      // 方式 1：直接配置 URL
      url: '//at.alicdn.com/t/c_xxxxxx.css',
      
      // 方式 2：不配置 url，使用环境变量 ICONFONT_URL
      // 或在 package.json 中配置 "iconfont": { "url": "..." }
      // 或创建 iconfont.config.js 文件
      
      // 下载失败时是否抛出错误（默认 true）
      failOnError: true,
      
      // ===== 字体文件下载配置 =====
      
      // 是否下载字体文件到本地（默认 true）
      downloadFonts: true,
      
      // 字体文件输出目录（默认 'public/fonts'）
      // 相对于项目根目录
      fontOutputDir: 'public/fonts',
      
      // 字体文件的公共访问路径（默认 '/fonts/'）
      // 这是在 CSS 中引用字体文件的路径
      fontPublicPath: '/fonts/'
    })
  ]
});

