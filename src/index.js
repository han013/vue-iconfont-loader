/**
 * Vue Iconfont Loader Plugin
 * 开发环境：在线引入样式
 * 生产环境：使用打包的本地样式
 */

// 生产环境时，导入本地样式文件（通过 vite 虚拟模块）
let localStyles = '';
if (process.env.NODE_ENV === 'production') {
  try {
    // 如果使用了 vite-plugin-iconfont，会通过虚拟模块注入
    localStyles = typeof __ICONFONT_CSS__ !== 'undefined' ? __ICONFONT_CSS__ : '';
  } catch (e) {
    console.warn('vue-iconfont-loader: 未找到本地样式文件');
  }
}

/**
 * 动态加载在线样式
 * @param {string} url - iconfont CSS URL
 */
function loadOnlineStyle(url) {
  // 检查是否已加载
  const existingLink = document.querySelector(`link[href="${url}"]`);
  if (existingLink) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url.startsWith('//') ? `https:${url}` : url;
  document.head.appendChild(link);
}

/**
 * 加载本地样式
 * @param {string} cssContent - CSS 内容
 */
function loadLocalStyle(cssContent) {
  if (!cssContent) return;

  // 检查是否已加载
  const existingStyle = document.querySelector('style[data-iconfont-local]');
  if (existingStyle) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-iconfont-local', 'true');
  style.textContent = cssContent;
  document.head.appendChild(style);
}

/**
 * Vue 插件
 */
const VueIconfontLoader = {
  install(app, options = {}) {
    const {
      url = '', // iconfont CSS URL，如：//at.alicdn.com/t/c_XXXXXX.css
      env = process.env.NODE_ENV, // 环境变量
      forceOnline = false, // 强制使用在线模式
      forceLocal = false // 强制使用本地模式
    } = options;

    if (!url && !forceLocal) {
      console.error('vue-iconfont-loader: 请提供 iconfont URL');
      return;
    }

    const isDev = env === 'development';

    // 强制模式优先
    if (forceOnline || (isDev && !forceLocal)) {
      // 开发环境或强制在线模式：加载在线样式
      loadOnlineStyle(url);
      console.log('vue-iconfont-loader: 已加载在线样式', url);
    } else {
      // 生产环境或强制本地模式：加载本地样式
      loadLocalStyle(localStyles);
      console.log('vue-iconfont-loader: 已加载本地样式');
    }

    // 添加全局属性（可选）
    app.config.globalProperties.$iconfont = {
      reload() {
        if (isDev || forceOnline) {
          loadOnlineStyle(url);
        } else {
          loadLocalStyle(localStyles);
        }
      }
    };
  }
};

// 默认导出 Vue 插件
export default VueIconfontLoader;

