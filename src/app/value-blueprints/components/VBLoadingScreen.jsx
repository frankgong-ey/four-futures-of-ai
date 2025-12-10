'use client';

import { useState, useEffect } from 'react';

export default function VBLoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 禁用滚动
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    
    // 开始加载模型
    loadModel();
    
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, []);

  const loadModel = async () => {
    try {
      const response = await fetch('/models/value-blueprint5.glb');
      
      if (!response.ok) {
        throw new Error('Failed to load model');
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : null;
      
      if (!total) {
        // 如果没有 content-length，直接等待响应完成
        await response.arrayBuffer();
        setProgress(100);
      } else {
        // 使用 ReadableStream 监听下载进度
        const reader = response.body.getReader();
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          receivedLength += value.length;
          const percent = Math.round((receivedLength / total) * 100);
          setProgress(percent);
        }
      }

      // 等待一小段时间确保进度条显示100%
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 通知加载完成
      onComplete();
      
    } catch (error) {
      console.error('Loading failed:', error);
      // 即使失败也继续，让用户看到页面
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));
      onComplete();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center"
      style={{ zIndex: 100000 }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* 文字 */}
        <div className="text-white text-2xl font-normal">
          Loading EY.ai Value Blueprints...{progress}%
        </div>
        
        {/* 进度条 */}
        <div className="w-80 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
