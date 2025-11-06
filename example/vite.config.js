/**
 * 示例项目的 Vite 配置
 * 展示如何在实际项目中使用 vue-iconfont-loader
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 在实际项目中，从 npm 包导入
// import VueIconfontPlugin from 'vue-iconfont-loader/vite';

// 在此示例中，从本地源码导入
import VueIconfontPlugin from '../src/vite-plugin.js';

export default defineConfig({
  plugins: [
    vue(),
    VueIconfontPlugin({
      // 配置你的 iconfont URL
      // url: '//at.alicdn.com/t/c_xxxxxx.css'
      
      // 或者在 package.json 中配置 "iconfont": { "url": "..." }
      // 或者设置环境变量 ICONFONT_URL
    })
  ]
});

