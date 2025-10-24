'use client';

import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import LineAnimation from './LineAnimation';

export default function LoadingScreen({ onComplete }) {
  const [loadingStage, setLoadingStage] = useState('loading'); // 直接进入loading状态
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  
  // LineAnimation 组件的引用
  const lineAnimationRef = useRef(null);

  // 组件挂载：立即禁用滚动，卸载时恢复，并开始自动加载
  useEffect(() => {
    // 组件挂载时禁用滚动
    document.body.style.overflow = 'hidden';
    
    // 立即开始自动加载
    startAutoLoading();
    
    // 组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 自动加载函数
  const startAutoLoading = async () => {
    // 立即启动线条动画
    if (lineAnimationRef.current) {
      lineAnimationRef.current.startAnimation();
    }
    
    // 开始真实的资源加载
    await loadBoothContent();
  };

  // 真实的资源加载进度
  const loadBoothContent = async () => {
    try {
      // 阶段1: 初始化 (0-10%)
      setLoadingMessage('Initializing...');
      setProgress(5);
      await new Promise(resolve => setTimeout(resolve, 300));

      // 阶段2: 加载3D模型 (10-50%)
      setLoadingMessage('Loading 3D models...');
      setProgress(10);
      await preloadResource('/models/question_consolidated_v5.glb');
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 200));

      // 阶段3: 加载纹理 (50-80%)
      setLoadingMessage('Loading textures...');
      setProgress(50);
      await preloadResource('/images/hero_gradient_new.svg');
      setProgress(60);
      await preloadResource('/images/hero_gradient.svg');
      setProgress(70);
      await new Promise(resolve => setTimeout(resolve, 200));

      // 阶段4: 编译shaders (80-95%)
      setLoadingMessage('Compiling shaders...');
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 300));

      // 阶段5: 完成 (95-100%)
      setLoadingMessage('Almost ready...');
      setProgress(95);
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(100);
      setLoadingMessage('Complete!');

      // 完成加载
      setTimeout(() => {
        setLoadingStage('complete');
        setTimeout(() => {
          // 确保滚动到顶部
          window.scrollTo(0, 0);
          onComplete();
        }, 500);
      }, 300);

    } catch (error) {
      console.error('Loading failed:', error);
      setLoadingMessage('Loading failed. Please refresh.');
    }
  };

  // 预加载资源函数
  const preloadResource = (url) => {
    return new Promise((resolve, reject) => {
      if (url.endsWith('.glb')) {
        // 3D模型加载 - 使用fetch预加载
        fetch(url)
          .then(response => {
            if (response.ok) {
              resolve(response);
            } else {
              reject(new Error(`Failed to load ${url}`));
            }
          })
          .catch(reject);
      } else {
        // 图片加载
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      }
    });
  };

  // 根据loadingStage动态改变布局和线条
  return (
    <>
      {loadingStage === 'complete' ? null : (
        <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
            
          {/* 背景渐变图 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'url(/images/hero_gradient_new.svg)',
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
              <div className="flex flex-col items-start justify-center">
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

          </div>

          {/* 加载进度显示 */}
          {loadingStage === 'loading' && (
            <div className="absolute bottom-16 right-16 text-white">
              <div className="text-2xl font-light">
                {loadingMessage} {progress}%
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
