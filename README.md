# vue-iconfont-loader

一个智能的 Vue 3 iconfont 加载插件，自动区分开发和生产环境：

- **开发环境**：在线引入 iconfont 样式（实时更新）
- **生产环境**：自动下载并打包到本地（无需外部依赖）

## 特性

✨ 自动环境识别（开发/生产）  
📦 生产环境自动下载并打包 CSS  
🔤 **自动下载字体文件到本地**  
🚀 开发环境直接引用在线资源  
🎯 支持阿里云 iconfont  
⚙️ 灵活的配置方式  
💪 TypeScript 类型支持（即将推出）

## 安装

```bash
npm install vue-iconfont-loader
# 或
yarn add vue-iconfont-loader
# 或
pnpm add vue-iconfont-loader
```

## 配置

### 方式 1：在 package.json 中配置（推荐）

```json
{
  "name": "your-project",
  "iconfont": {
    "url": "//at.alicdn.com/t/c_xxxxxx.css"
  }
}
```

### 方式 2：创建 iconfont.config.js

```javascript
module.exports = {
  url: '//at.alicdn.com/t/c_xxxxxx.css'
};
```

### 方式 3：使用环境变量

```bash
ICONFONT_URL=//at.alicdn.com/t/c_xxxxxx.css npm run build
```

## 使用

### 步骤 1：配置 Vite 插件（重要！）

在 `vite.config.js` 中添加 Vite 插件，用于生产环境自动下载 CSS：

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueIconfontPlugin from 'vue-iconfont-loader/vite';

export default defineConfig({
  plugins: [
    vue(),
    VueIconfontPlugin({
      url: '//at.alicdn.com/t/c_xxxxxx.css' // 你的 iconfont URL
    })
  ]
});
```

### 步骤 2：在 Vue 3 项目中注册 Vue 插件

```javascript
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import VueIconfontLoader from 'vue-iconfont-loader';

const app = createApp(App);

// 使用插件
app.use(VueIconfontLoader, {
  url: '//at.alicdn.com/t/c_xxxxxx.css' // 你的 iconfont URL
});

app.mount('#app');
```

### 在组件中使用

```vue
<template>
  <div>
    <!-- 使用 iconfont 类名 -->
    <i class="iconfont icon-home"></i>
    <i class="iconfont icon-user"></i>
  </div>
</template>
```

## 配置选项

### Vite 插件配置

```javascript
// vite.config.js
import VueIconfontPlugin from 'vue-iconfont-loader/vite';

VueIconfontPlugin({
  // iconfont CSS URL（可选，如果在其他地方配置了可以不填）
  url: '//at.alicdn.com/t/c_xxxxxx.css',
  
  // 下载失败时是否抛出错误（可选，默认：true）
  failOnError: true,
  
  // 是否下载字体文件到本地（可选，默认：true）
  downloadFonts: true,
  
  // 字体文件输出目录（可选，默认：'public/fonts'）
  fontOutputDir: 'public/fonts',
  
  // 字体文件的公共路径（可选，默认：'/fonts/'）
  fontPublicPath: '/fonts/'
})
```

Vite 插件会按以下优先级读取配置：
1. 插件选项 `url`
2. 环境变量 `ICONFONT_URL`
3. `iconfont.config.js` 文件
4. `package.json` 中的 `iconfont.url` 字段

### Vue 插件配置

```javascript
// main.js
app.use(VueIconfontLoader, {
  // iconfont CSS URL（必填，除非使用 forceLocal）
  url: '//at.alicdn.com/t/c_xxxxxx.css',
  
  // 环境变量（可选，默认：process.env.NODE_ENV）
  env: 'development',
  
  // 强制使用在线模式（可选，默认：false）
  forceOnline: false,
  
  // 强制使用本地模式（可选，默认：false）
  forceLocal: false
});
```

## 工作原理

### 开发环境（development）

- Vue 插件在页面中插入 `<link>` 标签，引用在线 iconfont CSS
- 样式实时同步，修改 iconfont 项目后刷新页面即可生效
- 无需重新打包

### 生产环境（production）

1. 在执行 `npm run build` 时，Vite 插件自动下载 CSS 文件
2. **自动下载字体文件（woff2, woff, ttf 等）到本地 `public/fonts` 目录**
3. **自动替换 CSS 中的字体 URL 为本地路径**
4. 通过 Vite 的 `define` 功能将处理后的 CSS 内容注入到代码中
5. 打包时将样式内容一起打包进 bundle（替换 `__ICONFONT_CSS__` 变量）
6. Vue 插件在运行时通过 `<style>` 标签注入样式到页面

**字体文件下载示例：**
```
在线 URL: //at.alicdn.com/t/c/font_5044312_xxxx.woff2
      ↓ 下载并替换
本地路径: /fonts/iconfont-abc12345.woff2
```

### 重要说明

⚠️ **注意：如果你是这个库的使用者（而不是开发者）**

- **必须**在你的项目的 `vite.config.js` 中配置 `VueIconfontPlugin`
- **必须**在你的项目的 `main.js` 中注册 Vue 插件
- 只有正确配置了 Vite 插件，打包时才会自动下载样式到本地

如果你发现打包时没有下载样式，请检查：
1. 是否在 `vite.config.js` 中添加了 `VueIconfontPlugin`
2. 是否配置了正确的 iconfont URL
3. 执行 `npm run build` 时是否看到 `[vite-plugin-iconfont]` 的日志输出

## 构建

如果你想发布这个包到 npm：

```bash
# 安装依赖
npm install

# 构建（会自动下载 CSS 并打包）
npm run build

# 发布到 npm
npm publish
```

## 快速开始

完整示例，在你的 Vue 3 项目中集成：

**1. 安装依赖**
```bash
npm install vue-iconfont-loader
```

**2. 配置 vite.config.js**
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

**3. 在 main.js 中注册**
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

**4. 在组件中使用**
```vue
<template>
  <i class="iconfont icon-home"></i>
</template>
```

## 获取 iconfont URL

1. 登录 [iconfont.cn](https://www.iconfont.cn/)
2. 进入你的图标项目
3. 点击"Font class"
4. 复制生成的 CSS 链接（形如：`//at.alicdn.com/t/c_xxxxxx.css`）

## 全局方法

插件会在 Vue 实例上注入 `$iconfont` 全局属性：

```javascript
// 在组件中重新加载样式
this.$iconfont.reload();
```

## 注意事项

1. **URL 格式**：支持 `//at.alicdn.com/...` 和 `https://at.alicdn.com/...` 格式
2. **打包大小**：生产环境会将 CSS 打包进 bundle，字体文件会保存到 `public/fonts` 目录
3. **缓存问题**：iconfont 更新后，记得更新 URL 中的版本号
4. **网络环境**：开发环境需要能访问阿里云 CDN，构建时也需要网络下载字体文件
5. **字体文件**：默认会下载 woff2、woff、ttf 等格式，确保 `public/fonts` 目录可写
6. **部署**：确保 `public` 目录下的字体文件被正确部署到服务器

## 开发

```bash
# 克隆项目
git clone <your-repo>

# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 常见问题

### Q: 为什么开发环境要用在线模式？

A: 开发环境使用在线模式可以实时同步 iconfont 的更新，当你在 iconfont.cn 上添加或修改图标后，只需刷新页面即可看到效果，无需重新打包。

### Q: 如何知道当前使用的是在线还是本地模式？

A: 打开浏览器控制台，插件会输出日志：
- `vue-iconfont-loader: 已加载在线样式` - 在线模式
- `vue-iconfont-loader: 已加载本地样式` - 本地模式

### Q: 打包失败，提示下载 CSS 失败？

A: 请检查：
1. iconfont URL 配置是否正确
2. 网络是否能访问阿里云 CDN
3. 可以先手动访问该 URL 确认是否可用

### Q: 可以在生产环境也使用在线模式吗？

A: 可以，设置 `forceOnline: true` 即可。但不推荐，因为：
- 依赖外部 CDN，可能影响加载速度
- 存在 CDN 不可用的风险
- 增加了外部依赖

