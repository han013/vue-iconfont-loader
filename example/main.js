import { createApp } from 'vue';
import App from './App.vue';
import VueIconfontLoader from 'vue-iconfont-loader';

const app = createApp(App);

// 注册 iconfont 加载插件
app.use(VueIconfontLoader, {
  // 方式1：直接配置 URL
  url: '//at.alicdn.com/t/c_xxxxxx.css',
  
  // 方式2：如果已在 package.json 或 iconfont.config.js 中配置，可以省略 url
  // app.use(VueIconfontLoader);
});

app.mount('#app');

