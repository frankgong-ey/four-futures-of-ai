"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import TextReveal from '../../../components/TextReveal';

/**
 * 第一屏HTML内容组件
 * 使用Tailwind的12列grid系统进行布局
 */
export default function HeroSection({ localScrollProgress = 0 }) {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const bottomTextRef = useRef(null);

  // 直接使用localScrollProgress驱动opacity变化：在95%-100%时淡出
  const opacity = localScrollProgress >= 0.95 ? 1 - (localScrollProgress - 0.95) / 0.05 : 1;

  // 滚动时的淡出效果
  useEffect(() => {
    if (titleRef.current && subtitleRef.current && bottomTextRef.current) {
      gsap.to([titleRef.current, subtitleRef.current, bottomTextRef.current], {
        opacity: opacity,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, [opacity]);

  return (
    <div className="h-screen text-white relative pointer-events-none">
      {/* 主标题区域 - 使用TextReveal组件 */}
      <div className="absolute top-[164px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-10">
        <div className="grid grid-cols-12 gap-[24px]">
          <div className="col-span-8 col-start-3 md:col-span-4 md:col-start-2 sm:col-span-12 sm:col-start-1 text-left">
            <TextReveal
              ref={titleRef}
              as="h1"
              className="text-[64px] md:text-[96px] sm:text-4xl leading-[0.9]"
              delay={0.5}
              stagger={0.3}
            >
              <span className="text-white/60">Will you shape </span>the future of AI,
            </TextReveal>
          </div>
        </div>
      </div>

      {/* 底部标题 - 使用TextReveal组件 */}
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
            <TextReveal
              ref={bottomTextRef}
              as="h2"
              className="text-[64px] md:text-[96px] sm:text-3xl leading-none"
              delay={1.1} // 在标题动画60%时开始
              stagger={0.3}
            >
              or will it shape you?
            </TextReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
