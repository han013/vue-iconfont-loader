/**
 * Vite 插件：在生产环境构建时自动下载 iconfont CSS
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import https from 'https';
import http from 'http';
import { createRequire } from 'module';

// 创建 require 函数以支持动态导入配置文件
const require = createRequire(import.meta.url);

/**
 * 从 package.json 读取配置
 */
function getConfigFromPackage(root) {
  try {
    const packagePath = join(root, 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    return packageJson.iconfont?.url || '';
  } catch (e) {
    return '';
  }
}

/**
 * 从 iconfont.config.js 读取配置
 */
function getConfigFromFile(root) {
  try {
    const configPath = join(root, 'iconfont.config.js');
    if (existsSync(configPath)) {
      // 使用动态 import 或 require
      const config = require(configPath);
      return config.url || config.default?.url || '';
    }
    return '';
  } catch (e) {
    return '';
  }
}

/**
 * 下载文件
 */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    // 处理 // 开头的 URL
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }

    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // 处理重定向
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`下载失败，状态码: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 处理 CSS 内容，将相对路径转换为绝对路径
 */
function processCssContent(cssContent, baseUrl) {
  // 替换 CSS 中的相对路径为绝对路径
  return cssContent.replace(/url\(['"]?(\.\.?\/[^'")\s]+)['"]?\)/g, (match, relPath) => {
    try {
      // 将相对路径转换为绝对路径
      const absoluteUrl = new URL(relPath, baseUrl).href;
      return `url('${absoluteUrl}')`;
    } catch (e) {
      return match;
    }
  });
}

/**
 * Vite 插件
 */
export default function vitePluginIconfont(options = {}) {
  let cssContent = '';
  let config;

  return {
    name: 'vite-plugin-iconfont',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async config(userConfig, { mode, command }) {
      // 只在生产环境构建时下载
      if (command !== 'build' || mode === 'development') {
        return;
      }

      // 获取 URL（优先级：插件选项 > 环境变量 > 配置文件 > package.json）
      const root = userConfig.root || process.cwd();
      let url = options.url 
        || process.env.ICONFONT_URL 
        || getConfigFromFile(root) 
        || getConfigFromPackage(root);

      if (!url) {
        console.warn('\n⚠️  [vite-plugin-iconfont] 警告: 未配置 iconfont URL');
        console.log('可以通过以下方式配置：');
        console.log('1. 在 vite.config.js 中配置插件选项: vitePluginIconfont({ url: "..." })');
        console.log('2. 设置环境变量 ICONFONT_URL');
        console.log('3. 在 package.json 中添加 "iconfont": { "url": "//at.alicdn.com/t/c_XXXXXX.css" }');
        console.log('4. 创建 iconfont.config.js 文件\n');
        
        // 注入空字符串
        return {
          define: {
            __ICONFONT_CSS__: JSON.stringify('')
          }
        };
      }

      try {
        console.log(`\n📦 [vite-plugin-iconfont] 开始下载 iconfont CSS...`);
        console.log(`   URL: ${url}`);
        
        const downloaded = await downloadFile(url);
        cssContent = processCssContent(downloaded, url);
        
        console.log(`✅ [vite-plugin-iconfont] CSS 下载成功！`);
        console.log(`   大小: ${(cssContent.length / 1024).toFixed(2)} KB\n`);

        // 通过 define 注入 CSS 内容
        return {
          define: {
            __ICONFONT_CSS__: JSON.stringify(cssContent)
          }
        };
      } catch (error) {
        console.error(`\n❌ [vite-plugin-iconfont] 下载失败:`, error.message);
        if (options.failOnError !== false) {
          throw error;
        }
        
        return {
          define: {
            __ICONFONT_CSS__: JSON.stringify('')
          }
        };
      }
    }
  };
}

