"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * 第一屏HTML内容组件
 * 使用Tailwind的12列grid系统进行布局
 */
export default function FirstScreen({ progress = 0 }) {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const bottomTextRef = useRef(null);

  useEffect(() => {
    if (progress >= 0.95) {
      // 淡出动画
      gsap.to([titleRef.current, subtitleRef.current, bottomTextRef.current], {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      // 淡入动画
      gsap.to([titleRef.current, subtitleRef.current, bottomTextRef.current], {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [progress]);

  return (
    <div className="h-screen text-white relative pointer-events-none">

        {/* 主标题区域 - 绝对定位在顶部 */}
        <div className="absolute top-[164px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-10">
          <div className="grid grid-cols-12 gap-[24px]">
            <div className="col-span-8 col-start-3 md:col-span-4 md:col-start-2 sm:col-span-12 sm:col-start-1 text-left">
              <h1 
                ref={titleRef}
                className="text-6xl md:text-[80px] sm:text-4xl leading-none"
              >
               Will you shape the future of AI,
              </h1>
            </div>
          </div>
        </div>

        {/* 底部标题 - 绝对定位，距离屏幕下边缘120px */}
        <div className="absolute bottom-[120px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-10">
          <div className="grid grid-cols-12 gap-[24px]">
            <div className="col-span-2 col-start-2 text-left flex items-end">
                <div 
                  ref={subtitleRef}
                  className="flex flex-col text-sm gap-[8px]"
                >
                    <div>2030 starts now:</div>
                    <div className="font-bold">Preparing for Four Futures of AI</div>
                </div>
            </div>
            <div className="col-span-6 col-start-6 text-right">
              <h2 
                ref={bottomTextRef}
                className="text-4xl md:text-[80px] sm:text-3xl leading-tight"
              >
                or will it shape you?
              </h2>
            </div>
          </div>
        </div>
        
    </div>
  );
}
