import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'VueIconfontLoader',
      formats: ['es', 'umd'],
      fileName: (format) => `vue-iconfont-loader.${format}.js`
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: [
        'vue',
        // Node.js 内置模块（用于 Vite 插件）
        'fs',
        'path',
        'https',
        'http'
      ],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
  // 不要在库构建时定义 __ICONFONT_CSS__，
  // 让它在使用者的项目中通过 vite-plugin-iconfont 来定义
});

