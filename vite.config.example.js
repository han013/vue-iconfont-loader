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
    // 在生产环境构建时自动下载 iconfont CSS
    VueIconfontPlugin({
      // 方式 1：直接配置 URL
      url: '//at.alicdn.com/t/c_xxxxxx.css',
      
      // 方式 2：不配置 url，使用环境变量 ICONFONT_URL
      // 或在 package.json 中配置 "iconfont": { "url": "..." }
      // 或创建 iconfont.config.js 文件
      
      // 下载失败时是否抛出错误（默认 true）
      failOnError: true
    })
  ]
});

