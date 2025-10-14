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
  const verticalRef2 = useRef(null);

  // 渐变refs已不需要（objectBoundingBox 会自适应线段长度）

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
    
    // 斜线动画
    diagonalRefs.current.forEach((line, i) => {
      if (line) {
        const x1 = parseFloat(line.getAttribute('x1')) || 0;
        const y1 = parseFloat(line.getAttribute('y1')) || 0;
        const x2 = parseFloat(line.getAttribute('x2')) || 0;
        const y2 = parseFloat(line.getAttribute('y2')) || 0;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const factor = 4; // 总长度放大倍数
        // 围绕中点对称扩展：
        const expand = (factor - 1) / 2;
        const targetX1 = x1 - dx * expand;
        const targetY1 = y1 - dy * expand;
        const targetX2 = x2 + dx * expand;
        const targetY2 = y2 + dy * expand;

        gsap.to(line, {
          attr: { 
            x1: targetX1,
            y1: targetY1,
            x2: targetX2, 
            y2: targetY2,
            strokeWidth: 3
          },
          duration: 1.2,
          ease: "power2.out",
          delay: i * 0.05
        });
      }
    });
    
    // 水平线：与斜线同样的“按比例加长”方式（围绕中点对称扩展）
    [horizontalRef1, horizontalRef2].forEach((ref, idx) => {
      if (ref.current) {
        const line = ref.current;
        const x1 = parseFloat(line.getAttribute('x1')) || 0;
        const x2 = parseFloat(line.getAttribute('x2')) || 0;
        const dx = x2 - x1;
        const factor = 10; // 与斜线一致：放大到原长度的3倍
        const expand = (factor - 1) / 2;
        let targetX1 = x1 - dx * expand;
        let targetX2 = x2 + dx * expand;

        gsap.to(line, {
          attr: { x1: targetX1, x2: targetX2, strokeWidth: 4 },
          duration: 1.2,
          ease: 'power2.out',
          delay: idx * 0.05
        });
      }
    });
    
    // 垂直线：与斜线同样的“按比例加长”方式（围绕中点对称扩展）
    [verticalRef, verticalRef2].forEach((ref, idx) => {
      if (ref.current) {
        const line = ref.current;
        const y1 = parseFloat(line.getAttribute('y1')) || 0;
        const y2 = parseFloat(line.getAttribute('y2')) || 0;
        const dy = y2 - y1;
        const factor = 10; // 放大到原长度的3倍
        const expand = (factor - 1) / 2;
        let targetY1 = y1 - dy * expand;
        let targetY2 = y2 + dy * expand;

        gsap.to(line, {
          attr: { y1: targetY1, y2: targetY2, strokeWidth: 4 },
          duration: 1.2,
          ease: 'power2.out',
          delay: idx * 0.05
        });
      }
    });
    
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
            <div className="flex items-center justify-center w-full max-w-6xl px-8 gap-12">
              {/* 左侧：线条SVG（可缩放） */}
              <div className="shrink-0 w-[360px] h-[640px] overflow-visible">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 360 640"
                  style={{ pointerEvents: 'none', display: 'block', overflow: 'visible' }}
                >
                  <defs>
                    {[
                      '#750D5D',
                      '#2BB856',
                      '#198CE6',
                      '#FF4136'
                    ].map((color, idx) => (
                      <linearGradient key={idx} id={`diagGrad${idx+1}`} x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#000000" stopOpacity="0" />
                        <stop offset="25%" stopColor={color} stopOpacity="1" />
                        <stop offset="75%" stopColor={color} stopOpacity="1" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                      </linearGradient>
                    ))}
                    <linearGradient id="whiteHorz1" x1="0" y1="0.5" x2="1" y2="0.5">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                      <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="whiteHorz2" x1="0" y1="0.5" x2="1" y2="0.5">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                      <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="whiteVert1" x1="0.5" y1="0" x2="0.5" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                      <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="whiteVert2" x1="0.5" y1="0" x2="0.5" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                      <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {[...Array(4)].map((_, i) => (
                    <line
                      key={`diagonal-${i}`}
                      ref={(el) => (diagonalRefs.current[i] = el)}
                      x1="160"
                      y1={368 + i * 22.4}
                      x2="360"
                      y2={80 + i * 22.4}
                      stroke={`url(#diagGrad${i+1})`}
                      strokeWidth="3"
                      opacity="1"
                      style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}
                    />
                  ))}
                
                  {/* 组成“4”的中横 */}
                  <line
                    ref={horizontalRef1}
                    x1="160"
                    y1="370"
                    x2="350"
                    y2="370.0001"
                    stroke="url(#whiteHorz1)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity="1"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
                  />

                  <line
                    ref={horizontalRef2}
                    x1="160"
                    y1="390"
                    x2="350"
                    y2="390.0001"
                    stroke="url(#whiteHorz2)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity="1"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
                  />

                  {/* 组成“4”的右立柱 */}
                  <line
                    ref={verticalRef}
                    x1="320"
                    y1="120"
                    x2="320.0001"
                    y2="480"
                    stroke="url(#whiteVert1)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity="1"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
                  />

                  <line
                    ref={verticalRef2}
                    x1="340"
                    y1="120"
                    x2="340.0001"
                    y2="480"
                    stroke="url(#whiteVert2)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity="1"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
                  />
                </svg>
              </div>

              {/* 右侧：EY logo和文字 */}
              <div className={`flex flex-col items-start justify-center transition-opacity duration-500 ${loadingStage === 'loading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* EY Logo */}
                <div className="mb-8">
                  <img src="/images/EY_logo.svg" alt="EY" className="h-16 w-auto" />
                </div>

                {/* Four Futures of AI */}
                <div className="text-white">
                  <div className="text-6xl font-light leading-tight tracking-[-2px]">
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
                className="flex items-center text-white text-lg hover:opacity-80 transition-opacity"
              >
                <span className="mr-4">Explore Now</span>
                <div className="w-16 h-16 border border-white rounded-full flex items-center justify-center">
                  <img src="/images/arrow-right.svg" alt="" className="w-6 h-6" aria-hidden="true" />
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
