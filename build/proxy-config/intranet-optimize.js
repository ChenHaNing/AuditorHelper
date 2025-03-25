/**
 * 内网穿透优化代理配置
 * 使用方法：
 * 1. 在内网穿透服务中设置自定义请求头: X-Proxy-Optimization: enabled
 * 2. 或者在URL中添加参数: ?optimize=intranet
 */

// 需要直接拦截的资源类型（减少带宽消耗）
const BLOCK_EXTENSIONS = ['.map', '.woff', '.woff2', '.ttf'];

// 只加载中文翻译文件，其他语言包拦截
const CHINESE_TRANSLATION_FILE = 'translation.DqA2XG1L.js';

// 主核心函数 - 决定是否允许资源加载
function shouldBlockResource(url) {
  // 检查是否是不需要的语言资源
  if (url.includes('/chunks/translation.') && !url.includes(CHINESE_TRANSLATION_FILE)) {
    console.log('[内网穿透优化] 已拦截非中文语言包:', url);
    return true;
  }
  
  // 检查是否是源映射文件 (.map)
  for (const ext of BLOCK_EXTENSIONS) {
    if (url.endsWith(ext)) {
      console.log('[内网穿透优化] 已拦截非必要资源:', url);
      return true;
    }
  }
  
  return false;
}

// 内网穿透优化处理程序
const proxyOptimizeHandler = {
  // 拦截请求
  onRequest: function(req, res) {
    const url = req.url;
    
    // 检查是否启用了优化模式
    const isOptimized = 
      req.headers['x-proxy-optimization'] === 'enabled' || 
      url.includes('optimize=intranet');
    
    if (isOptimized && shouldBlockResource(url)) {
      // 返回空响应，减少带宽消耗
      res.writeHead(204, {'Content-Type': 'text/plain'});
      res.end();
      return true; // 表示请求已处理
    }
    
    // 不拦截请求
    return false;
  },
  
  // 修改响应（可选）
  onResponse: function(req, res, body) {
    // 这里可以添加对响应内容的处理逻辑，如压缩HTML等
    return body;
  }
};

// 导出处理程序
module.exports = proxyOptimizeHandler;

// 附加说明文档：如何使用
/**
 * 使用指南：
 * 
 * 1. 在内网穿透服务（如frp, ngrok）中添加此文件作为中间件
 * 
 * 2. 如使用nginx作为反向代理，可以添加以下配置：
 *    location / {
 *      proxy_pass http://your_original_server;
 *      proxy_set_header X-Proxy-Optimization "enabled";
 *    }
 * 
 * 3. 或者直接访问URL时添加参数：
 *    http://your-proxy-url.com/?optimize=intranet
 */
