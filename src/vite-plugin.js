/**
 * Vite 插件：在生产环境构建时自动下载 iconfont CSS
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import https from 'https';
import http from 'http';
import { createRequire } from 'module';
import crypto from 'crypto';

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
 * 下载文本文件
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
 * 下载二进制文件
 */
function downloadBinaryFile(url) {
  return new Promise((resolve, reject) => {
    // 处理 // 开头的 URL
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }

    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // 处理重定向
        downloadBinaryFile(res.headers.location).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`下载失败，状态码: ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        resolve(Buffer.concat(chunks));
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
 * 下载字体文件并替换 CSS 中的 URL
 */
async function downloadFontsAndProcessCss(cssContent, options = {}) {
  const { outputDir = 'public/fonts', publicPath = '/fonts/' } = options;
  
  // 提取所有字体文件 URL（匹配 woff2, woff, ttf, eot, svg 等格式）
  const fontUrlRegex = /url\(['"]?((?:https?:)?\/\/[^'")\s]+\.(?:woff2|woff|ttf|eot|svg)(?:\?[^'")\s]*)?)['"]?\)/g;
  const fontUrls = [];
  let match;
  
  while ((match = fontUrlRegex.exec(cssContent)) !== null) {
    const url = match[1];
    if (url && !fontUrls.includes(url)) {
      fontUrls.push(url);
    }
  }
  
  if (fontUrls.length === 0) {
    return cssContent;
  }
  
  console.log(`   找到 ${fontUrls.length} 个字体文件，开始下载...`);
  
  // 创建字体目录
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (e) {
    // 目录已存在，忽略错误
  }
  
  // 下载字体文件
  const urlMap = new Map(); // 原始 URL -> 本地路径
  
  for (let i = 0; i < fontUrls.length; i++) {
    let url = fontUrls[i];
    
    try {
      // 处理 // 开头的 URL
      if (url.startsWith('//')) {
        url = 'https:' + url;
      }
      
      // 提取文件扩展名
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const ext = pathname.match(/\.(woff2|woff|ttf|eot|svg)$/i)?.[1] || 'woff2';
      
      // 使用 URL 的 hash 生成唯一文件名
      const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
      const fileName = `iconfont-${hash}.${ext}`;
      const filePath = join(outputDir, fileName);
      
      console.log(`   下载字体 ${i + 1}/${fontUrls.length}: ${fileName}`);
      
      // 下载字体文件
      const buffer = await downloadBinaryFile(url);
      writeFileSync(filePath, buffer);
      
      // 记录映射关系（注意：去除 https: 前缀，保留 // 开头的格式）
      const originalUrl = fontUrls[i];
      urlMap.set(originalUrl, publicPath + fileName);
      
      console.log(`   ✓ 已保存: ${filePath} (${(buffer.length / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.warn(`   ⚠️  字体下载失败: ${url}`, error.message);
      // 如果下载失败，保留原始 URL
    }
  }
  
  // 替换 CSS 中的 URL
  let processedCss = cssContent;
  for (const [originalUrl, localPath] of urlMap.entries()) {
    // 需要转义特殊字符用于正则表达式
    const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`url\\(['"]?${escapedUrl}['"]?\\)`, 'g');
    processedCss = processedCss.replace(regex, `url('${localPath}')`);
  }
  
  console.log(`   ✅ 字体文件下载完成，已替换 ${urlMap.size} 个 URL`);
  
  return processedCss;
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
      // 只在 build 命令时下载 CSS
      // 注意：不管是什么 mode，只要是 build 就下载，让用户可以灵活控制
      if (command !== 'build') {
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
        let processedCss = processCssContent(downloaded, url);
        
        console.log(`✅ [vite-plugin-iconfont] CSS 下载成功！`);
        console.log(`   大小: ${(processedCss.length / 1024).toFixed(2)} KB`);

        // 下载字体文件（如果配置了 downloadFonts）
        if (options.downloadFonts !== false) {
          console.log(`\n🔤 [vite-plugin-iconfont] 开始下载字体文件...`);
          const fontOptions = {
            outputDir: options.fontOutputDir || join(root, 'public/fonts'),
            publicPath: options.fontPublicPath || '/fonts/'
          };
          processedCss = await downloadFontsAndProcessCss(processedCss, fontOptions);
        }
        
        cssContent = processedCss;
        console.log(`\n✨ [vite-plugin-iconfont] 所有资源下载完成！\n`);

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

