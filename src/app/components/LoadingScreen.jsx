'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function LoadingScreen({ onComplete }) {
  const [loadingStage, setLoadingStage] = useState('initial'); // 'initial' | 'loading' | 'complete'
  const [progress, setProgress] = useState(0);
  
  // SVG线条的refs
  const diagonalRefs = useRef([]);
  const horizontalRef1 = useRef(null);
  const horizontalRef2 = useRef(null);
  const verticalRef = useRef(null);

  // 组件挂载时立即禁用滚动，卸载时恢复
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
    
    // 使用GSAP动画延伸线条
    diagonalRefs.current.forEach((line, i) => {
      if (line) {
        gsap.to(line, {
          attr: { 
            x2: 1100, 
            y2: 750 + i * 12,
            strokeWidth: 3
          },
          duration: 1.2,
          ease: "power2.out",
          delay: i * 0.05
        });
      }
    });
    
    if (horizontalRef1.current) {
      gsap.to(horizontalRef1.current, {
        attr: { x2: 1100, strokeWidth: 3 },
        duration: 1.2,
        ease: "power2.out",
        delay: 0.3
      });
    }
    
    if (horizontalRef2.current) {
      gsap.to(horizontalRef2.current, {
        attr: { x2: 1100, strokeWidth: 3 },
        duration: 1.2,
        ease: "power2.out",
        delay: 0.35
      });
    }
    
    if (verticalRef.current) {
      gsap.to(verticalRef.current, {
        attr: { y2: 700, strokeWidth: 3 },
        duration: 1.2,
        ease: "power2.out",
        delay: 0.4
      });
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

  // 统一渲染方法，根据loadingStage动态改变布局和线条
  return (
    <>
      {loadingStage === 'complete' ? null : (
        <div className="fixed inset-0 bg-black z-50">
          {/* SVG线条层 - 始终存在，通过状态控制延伸 */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1200 800"
            className="absolute inset-0"
            style={{ 
              pointerEvents: 'none'
            }}
          >
            {/* 定义渐变 */}
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="25%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="75%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>

            {/* 彩色渐变对角线组 */}
            {[...Array(5)].map((_, i) => (
              <line
                key={`diagonal-${i}`}
                ref={(el) => (diagonalRefs.current[i] = el)}
                x1="300"
                y1={150 + i * 8}
                x2="600"
                y2={450 + i * 8}
                stroke="url(#gradient1)"
                strokeWidth="2"
                opacity="0.8"
                style={{
                  filter: 'drop-shadow(0 0 6px currentColor)'
                }}
              />
            ))}

            {/* 白色水平线1 */}
            <line
              ref={horizontalRef1}
              x1="350"
              y1="280"
              x2="630"
              y2="280"
              stroke="white"
              strokeWidth="2"
              opacity="0.9"
              style={{
                filter: 'drop-shadow(0 0 6px white)'
              }}
            />

            {/* 白色水平线2 */}
            <line
              ref={horizontalRef2}
              x1="350"
              y1="300"
              x2="630"
              y2="300"
              stroke="white"
              strokeWidth="2"
              opacity="0.9"
              style={{
                filter: 'drop-shadow(0 0 6px white)'
              }}
            />

            {/* 白色垂直线 */}
            <line
              ref={verticalRef}
              x1="600"
              y1="180"
              x2="600"
              y2="480"
              stroke="white"
              strokeWidth="2"
              opacity="0.9"
              style={{
                filter: 'drop-shadow(0 0 6px white)'
              }}
            />
          </svg>

          {/* UI内容层 */}
          <div className={`relative w-full h-full flex items-center justify-center transition-opacity duration-500 ${loadingStage === 'loading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center justify-center w-full max-w-6xl px-8">
              {/* 左侧占位 */}
              <div className="flex-1"></div>

              {/* 右侧：EY logo和文字 */}
              <div className="flex-1 flex flex-col items-start justify-center pl-16">
                {/* EY Logo */}
                <div className="mb-8">
                  <div className="text-white text-2xl font-bold flex items-center">
                    EY
                    <div className="ml-2 w-0 h-0 border-l-[4px] border-l-transparent border-b-[6px] border-b-white border-r-[4px] border-r-transparent"></div>
                  </div>
                </div>

                {/* Four Futures of AI */}
                <div className="text-white">
                  <div className="text-6xl font-light leading-tight">
                    <div>Four</div>
                    <div>Futures</div>
                    <div>of AI</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore Now按钮 */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
              <button
                onClick={handleExploreClick}
                className="flex items-center text-white text-lg hover:opacity-80 transition-opacity"
              >
                <span className="mr-4">Explore Now</span>
                <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                </div>
              </button>
            </div>
          </div>

          {/* 加载进度显示 */}
          {loadingStage === 'loading' && (
            <div className="absolute bottom-16 right-16 text-white">
              <div className="text-lg font-light">
                Loading Futures...{progress}%
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
