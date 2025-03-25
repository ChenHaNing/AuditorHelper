// 页面加载超时处理与资源预加载优化
(function() {
  // 延迟加载计划
  const delayLoadChunks = [];
  const immediateLoadChunks = [
    '/static/splash.png',
    '/build/_app/immutable/chunks/translation.DqA2XG1L.js' // 中文翻译文件
  ];
  
  // 阻止不必要的语言文件加载
  const skipTranslationFiles = (event) => {
    const url = event.url || (event.request && event.request.url);
    if (!url) return;
    
    // 如果是加载翻译文件但不是中文的，则阻止加载
    if (url.includes('/chunks/translation.') && !url.includes('DqA2XG1L.js')) {
      event.preventDefault();
      console.log('已阻止加载非中文语言包:', url);
      return;
    }
  };
  
  // 监听资源加载
  if (window.performance && window.performance.getEntriesByType) {
    window.addEventListener('load', function() {
      const resources = window.performance.getEntriesByType('resource');
      let translationCount = 0;
      resources.forEach(res => {
        if (res.name.includes('/chunks/translation.')) {
          translationCount++;
        }
      });
      console.log('已加载的翻译文件数量:', translationCount);
    });
  }
  
  // 页面加载事件处理
  document.addEventListener('DOMContentLoaded', function() {
    // 获取加载屏幕元素
    const splashScreen = document.getElementById('splash-screen');
    
    if (splashScreen) {
      // 设置最大等待时间（3秒）
      const maxWaitTime = 3000;
      
      // 加载中文语言设置
      try {
        localStorage.locale = 'zh-CN';
        localStorage.i18nextLng = 'zh-CN';
        console.log('语言已默认设置为中文');
      } catch (e) {
        console.error('设置语言失败:', e);
      }
      
      // 检测是否为内网穿透环境
      const isSlowNetwork = window.isSlowNetwork || 
        (navigator.connection && ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType));
      
      // 在内网穿透环境中更激进地移除启动画面
      if (isSlowNetwork) {
        setTimeout(function() {
          if (splashScreen && splashScreen.parentNode) {
            splashScreen.parentNode.removeChild(splashScreen);
            console.log('内网穿透模式: 启动画面已强制移除');
          }
        }, 1500);  // 慢网络只等待1.5秒
      } else {
        setTimeout(function() {
          if (splashScreen && splashScreen.parentNode) {
            splashScreen.parentNode.removeChild(splashScreen);
            console.log('启动画面已超时移除');
          }
        }, maxWaitTime);
      }
      
      // 阻止非必要资源加载
      if (isSlowNetwork) {
        window.addEventListener('beforeunload', function() {
          // 清理资源
          console.log('正在清理资源以减轻内网穿透负担');
        });
      }
      
      // 向主窗口发送消息，表示加载进度
      window.parent.postMessage({ type: 'loading_progress', progress: 100 }, '*');
    }
    
    // 预载关键资源
    try {
      const criticalResources = [
        '/api/config',
        '/api/v1/auths/'
      ];
      
      criticalResources.forEach(url => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'fetch';
        preloadLink.href = url;
        preloadLink.crossOrigin = 'anonymous';
        document.head.appendChild(preloadLink);
      });
    } catch (e) {
      console.error('Preload error:', e);
    }
  });
})();
