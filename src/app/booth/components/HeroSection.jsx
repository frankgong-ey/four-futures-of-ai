"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * First screen HTML content component
 * Layout uses Tailwind's 12-column grid system
 */
export default function HeroSection({ localScrollProgress = 0, isLoaded = false }) {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const bottomTextRef = useRef(null);

  // 当滚动到 gallerySection 时（localScrollProgress > 0.1），强制隐藏所有文字
  // 否则正常显示（在接近结束前淡出）
  const shouldForceHide = localScrollProgress > 0.1;
  const opacity = shouldForceHide 
    ? 0 
    : (localScrollProgress >= 0.95 ? 1 - (localScrollProgress - 0.95) / 0.05 : 1);

  // 立即隐藏或淡出文字
  useEffect(() => {
    if (titleRef.current && subtitleRef.current && bottomTextRef.current) {
      gsap.to([titleRef.current, subtitleRef.current, bottomTextRef.current], {
        opacity: opacity,
        duration: shouldForceHide ? 0.1 : 0.5, // 强制隐藏时使用更快的动画
        ease: shouldForceHide ? "none" : "power2.out"
      });
    }
  }, [opacity, shouldForceHide]);

  return (
    <div className="h-screen text-white relative pointer-events-none">
      {/* Main title - uses TextReveal */}
      <div className="absolute top-[164px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-10">
        <div className="grid grid-cols-12 gap-[24px]">
          <div className="col-span-8 col-start-3 md:col-span-5 md:col-start-2 sm:col-span-12 sm:col-start-1 text-left">
            <h1
              ref={titleRef}
              className="text-[64px] md:text-[96px] sm:text-4xl leading-none tracking-[-0.05em]"
            >
              <span className="text-white/60">Will you shape </span>the future of AI,
            </h1>
          </div>
        </div>
      </div>

      {/* Bottom title - uses TextReveal */}
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
              className="text-[64px] md:text-[96px] sm:text-3xl leading-none tracking-[-0.05em]"
            >
              or will it shape you?
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
