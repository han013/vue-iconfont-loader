/**
 * 下载 iconfont CSS 文件并保存到本地
 * 用于生产环境打包
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 从环境变量或配置文件读取 URL
const ICONFONT_URL = process.env.ICONFONT_URL || '';

/**
 * 从 package.json 读取配置
 */
function getConfigFromPackage() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    return packageJson.iconfont?.url || '';
  } catch (e) {
    return '';
  }
}

/**
 * 从 iconfont.config.js 读取配置
 */
function getConfigFromFile() {
  try {
    const configPath = path.join(process.cwd(), 'iconfont.config.js');
    if (fs.existsSync(configPath)) {
      const config = require(configPath);
      return config.url || '';
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
    // 将相对路径转换为绝对路径
    const absoluteUrl = new URL(relPath, baseUrl).href;
    return `url('${absoluteUrl}')`;
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('开始下载 iconfont CSS...');

  // 获取 URL（优先级：环境变量 > 配置文件 > package.json）
  let url = ICONFONT_URL || getConfigFromFile() || getConfigFromPackage();

  if (!url) {
    console.warn('⚠️  警告: 未配置 iconfont URL');
    console.log('可以通过以下方式配置：');
    console.log('1. 设置环境变量 ICONFONT_URL');
    console.log('2. 在 package.json 中添加 "iconfont": { "url": "//at.alicdn.com/t/c_XXXXXX.css" }');
    console.log('3. 创建 iconfont.config.js 文件，导出 { url: "//at.alicdn.com/t/c_XXXXXX.css" }');
    console.log('');
    console.log('跳过下载，将使用在线模式...');
    
    // 创建空的样式文件
    const outputDir = path.join(__dirname, '../src');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, 'iconfont.css.js');
    fs.writeFileSync(outputPath, 'export default "";', 'utf-8');
    return;
  }

  try {
    // 下载 CSS
    console.log(`下载地址: ${url}`);
    const cssContent = await downloadFile(url);

    // 处理 CSS 内容
    const processedCss = processCssContent(cssContent, url);

    // 保存为 JS 模块
    const outputDir = path.join(__dirname, '../src');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'iconfont.css.js');
    const jsContent = `export default ${JSON.stringify(processedCss)};`;
    fs.writeFileSync(outputPath, jsContent, 'utf-8');

    console.log('✅ CSS 下载成功！');
    console.log(`文件大小: ${(cssContent.length / 1024).toFixed(2)} KB`);
    console.log(`保存位置: ${outputPath}`);
  } catch (error) {
    console.error('❌ 下载失败:', error.message);
    process.exit(1);
  }
}

main();

