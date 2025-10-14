'use client';

import { useState, useEffect, useRef } from 'react';
import LineAnimation from './LineAnimation';

export default function LoadingScreen({ onComplete }) {
  const [loadingStage, setLoadingStage] = useState('initial'); // 'initial' | 'loading' | 'complete'
  const [progress, setProgress] = useState(0);
  
  // LineAnimation 组件的引用
  const lineAnimationRef = useRef(null);

  // 组件挂载：立即禁用滚动，卸载时恢复
  useEffect(() => {
    // 组件挂载时禁用滚动
    document.body.style.overflow = 'hidden';
    
    // 组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 处理Explore Now按钮点击
  const handleExploreClick = () => {
    setLoadingStage('loading');
    
    // 启动线条动画
    if (lineAnimationRef.current) {
      lineAnimationRef.current.startAnimation();
    }
    
    startLoading();
  };

  // 开始加载进度
  const startLoading = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5; // 随机增长5-20%
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setLoadingStage('complete');
          setTimeout(() => {
            // 确保滚动到顶部
            window.scrollTo(0, 0);
            onComplete();
          }, 500);
        }, 300);
      }
      setProgress(Math.round(currentProgress));
    }, 200);
  };

  // 根据loadingStage动态改变布局和线条
  return (
    <>
      {loadingStage === 'complete' ? null : (
        <div className="fixed inset-0 bg-black z-50">
            
          {/* 背景渐变图 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'url(/images/gradient.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.9
            }}
          />

          {/* UI内容层 */}
          <div className={`relative w-full h-full flex items-center justify-center`}>
            <div className="flex items-center justify-center w-full max-w-6xl px-8">
              {/* 左侧：线条动画组件 */}
              <LineAnimation ref={lineAnimationRef} />

              {/* 右侧：EY logo和文字 */}
              <div className={`flex flex-col items-start justify-center transition-opacity duration-500 ${loadingStage === 'loading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* EY Logo */}
                <div className="mb-4">
                  <img src="/images/EY_logo.svg" alt="EY" className="h-16 w-auto" />
                </div>

                {/* Four Futures of AI */}
                <div className="text-white">
                  <div className="text-6xl font-light leading-none tracking-[-2px]">
                    <div>Four</div>
                    <div>Futures</div>
                    <div>of AI</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore Now按钮 */}
            <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${loadingStage === 'loading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <button
                onClick={handleExploreClick}
                className="group flex items-center text-white text-lg hover:opacity-80 transition-opacity cursor-pointer"
              >
                <span className="mr-4">Explore Now</span>
                <div className="w-16 h-16 border border-white rounded-full flex items-center justify-center">
                  <img src="/images/arrow-right.svg" alt="" className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </button>
            </div>
          </div>

          {/* 加载进度显示 */}
          {loadingStage === 'loading' && (
            <div className="absolute bottom-16 right-16 text-white">
              <div className="text-2xl font-light">
                Loading Futures...{progress}%
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
