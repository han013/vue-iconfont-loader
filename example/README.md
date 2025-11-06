# 使用示例

这个示例展示了如何在 Vue 3 项目中使用 vue-iconfont-loader。

## 快速开始

### 1. 安装插件

```bash
npm install vue-iconfont-loader
```

### 2. 配置 Vite 插件

在 `vite.config.js` 中添加：

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueIconfontPlugin from 'vue-iconfont-loader/vite';

export default defineConfig({
  plugins: [
    vue(),
    VueIconfontPlugin({
      url: '//at.alicdn.com/t/c_xxxxxx.css'
    })
  ]
});
```

### 3. 配置 iconfont URL（可选）

除了在 Vite 插件中配置，你也可以在其他地方配置：

在 `package.json` 中添加：

```json
{
  "iconfont": {
    "url": "//at.alicdn.com/t/c_xxxxxx.css"
  }
}
```

或创建 `iconfont.config.js`：

```javascript
module.exports = {
  url: '//at.alicdn.com/t/c_xxxxxx.css'
};
```

### 4. 注册 Vue 插件

在 `main.js` 中：

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import VueIconfontLoader from 'vue-iconfont-loader';

const app = createApp(App);

app.use(VueIconfontLoader, {
  url: '//at.alicdn.com/t/c_xxxxxx.css'
});

app.mount('#app');
```

### 5. 使用图标

在组件中：

```vue
<template>
  <i class="iconfont icon-home"></i>
</template>
```

## 运行示例

```bash
# 开发模式（使用在线 CSS）
npm run dev

# 生产构建（下载并打包 CSS）
npm run build
```

## 注意事项

1. 将示例中的 `c_xxxxxx` 替换为你的实际 iconfont 项目代码
2. 确保图标类名（如 `icon-home`）与你的 iconfont 项目中的类名一致
3. 开发环境需要网络访问阿里云 CDN

