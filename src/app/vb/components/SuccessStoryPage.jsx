"use client";

import React, { useEffect } from "react";

export default function SuccessStoryPage({ onBack }) {
  // 确保页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section 
      className="relative w-full text-white z-10 bg-black"
      style={{ 
        fontFamily: 'var(--font-eyinterstate)',
        height: '100vh',
      }}
    >
      {/* 背景图片 - 保持长宽比 */}
      <img 
        src="/images/value-blueprints/ss-ey-hero.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 5 }}
      />

      {/* 内容层 */}
      <div className="relative w-full h-full z-10">
        {/* 垂直中心的分割线 - 从左到右横跨整个屏幕 */}
        <div className="absolute left-0 right-0 top-1/2 border-t border-gray-400/30 z-10" />

        {/* Success Stories - 在分割线左侧上方，距离分割线 8px（原 EY Logo 位置） */}
        <p 
          className="absolute left-6 md:left-8 lg:left-12 text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px] font-bold text-white whitespace-nowrap leading-[1.5] z-20"
          style={{ 
            bottom: 'calc(50% + 16px)', // 分割线位置 + 8px 距离
            fontFamily: 'var(--font-eyinterstate)'
          }}
        >
          Success Stories
        </p>

        {/* 主要内容区域 - 在分割线下方，中间偏右 */}
        <div 
          className="absolute top-1/2 mt-8 md:mt-12 lg:mt-16 z-10 leading-none"
          style={{ 
            left: '60%', // 中间偏右（50% + 5%）
            transform: 'translateX(-50%)' // 以自身中心对齐
          }}
        >
          <div className="flex flex-col gap-2 md:gap-3 lg:gap-4">
            {/* EY Client Zero - 在 Risk Assessment 上方 */}
            <p 
              className="text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-bold text-white whitespace-nowrap leading-[1.5]"
              style={{ 
                fontFamily: 'var(--font-eyinterstate)'
              }}
            >
              EY Client Zero
            </p>
            
            {/* Risk Assessment 标题 - 从左到右的从白色到黄色渐变 */}
            <h1 
              className="text-[48px] sm:text-[60px] md:text-[72px] lg:text-[80px] xl:text-[96px] font-normal leading-none tracking-[-4px] bg-gradient-to-r from-white to-[#EAD726] bg-clip-text text-transparent"
              style={{ 
                WebkitTextFillColor: 'transparent',
                fontFamily: 'var(--font-eyinterstate)'
              }}
            >
              Risk Assessment
            </h1>
          </div>
        </div>

        {/* Back 按钮 - 在左下角 */}
        <button 
          onClick={onBack}
          className="absolute bottom-6 md:bottom-8 lg:bottom-12 left-6 md:left-8 lg:left-12 z-20 flex items-center gap-2 px-4 py-2 border border-white/50 hover:bg-white/10 transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-eyinterstate)' }}
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M7.5 2L4.5 6L7.5 10" 
              stroke="white" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-white text-[16px] md:text-[18px]">Back</span>
        </button>
      </div>
    </section>
  );
}

