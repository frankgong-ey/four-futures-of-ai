"use client";

import React from "react";

export default function Section4() {
  return (
    <section 
      className="relative w-full text-white"
      style={{ 
        minHeight: '100vh', 
        fontFamily: 'var(--font-eyinterstate)', 
        paddingLeft: '5%', 
        paddingRight: '5%', 
        position: 'relative', 
        zIndex: 10, 
        backgroundColor: '#000000' 
      }}
    >
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/value-blueprints/section4-bg.png)',
          opacity: 0.9,
          zIndex: 0
        }}
      />
      {/* 黑色遮罩层 - 让图片更暗 */}
      <div 
        className="absolute inset-0 bg-black"
        style={{
          zIndex: 1,
          opacity: 0.3
        }}
      />

      {/* Quote 文字 - 屏幕左下侧 */}
      <div 
        className="absolute bottom-16 md:bottom-28 left-[5%] right-[5%] pb-4 md:pb-8 lg:pb-16 z-10 max-w-[1024px]"
      >
        {/* Quote mark 图标 - 左对齐 */}
        <div className="mb-2 md:mb-4">
          <img 
            src="/images/value-blueprints/quote-mark.svg" 
            alt="Quote mark"
            className="h-auto w-10 md:w-14 lg:w-[66px]"
          />
        </div>
        
        <p 
          className="text-[32px] sm:text-[48px] md:text-[64px] font-normal leading-none text-left"
          style={{
            letterSpacing: '-0.05em',
          }}
        >
          What if we reimagine the business with AI - to become an{' '}
          <span 
            className="inline"
            style={{
              background: 'linear-gradient(to right, white, #EAD726)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              paddingRight: '0.1em', // 确保问号不被裁切
            }}
          >
            Agentic Enterprise?
          </span>
        </p>
      </div>
    </section>
  );
}

