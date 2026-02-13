"use client";

import React from "react";

export default function Section1({ onGetStartedClick }) {
  return (
    <section 
      className="relative w-full text-white z-10 bg-black"
      style={{ 
        fontFamily: 'var(--font-eyinterstate)',
        height: '110vh',
      }}
    >
      {/* 背景图片 - 使用 absolute 定位，宽度100%，高度固定100vh */}
      <img 
        src="/images/value-blueprints/vb-heroBg.png"
        alt="Background"
        className="absolute inset-0 w-full"
        style={{
          zIndex: 5, // Section2 的 z-index 要比这个低
          height: '120vh',
          objectFit: 'fill', // 填充，允许图片变形
        }}
      />

      {/* 内容层 */}
      <div className="relative w-full h-screen z-10">
        {/* 纹理图片 - 水平居中，紧贴分割线上方，最大宽度400px，50%白色描边 */}
        <div 
          className="absolute left-1/2 -translate-x-1/2"
          style={{ 
            bottom: '50%', // 底部对齐到分割线
            maxWidth: '300px',
            width: '100%',
            padding: '0 16px',
            zIndex: 15
          }}
        >
          <img 
            src="/images/value-blueprints/texture.png" 
            alt="Texture" 
            className="w-full h-auto object-contain"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.5)', // 50%白色描边
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* 垂直中心的分割线 - 从左到右横跨整个屏幕 */}
        <div className="absolute left-0 right-0 top-1/2 border-t border-gray-400/30 z-10" />

        {/* EY Logo - 在分割线左侧上方，距离分割线 8px */}
        <div 
          className="absolute left-6 md:left-8 lg:left-12 z-20"
          style={{ 
            bottom: 'calc(50% + 16px)', // 分割线位置 + 8px 距离
          }}
        >
          <img 
            src="/images/EY_logo_yellow.svg" 
            alt="EY" 
            className="h-12 md:h-16 lg:h-20 w-auto object-contain" 
          />
        </div>

        {/* EY Consulting - 在分割线右侧下方，距离分割线 8px */}
        <p 
          className="absolute right-6 md:right-8 lg:right-12 text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-bold text-white whitespace-nowrap leading-[1.5] z-20"
          style={{ 
            top: 'calc(50% + 16px)', // 分割线位置 + 8px 距离
            fontFamily: 'var(--font-eyinterstate)'
          }}
        >
          EY Consulting
        </p>

        {/* 主要内容区域 - 在分割线下方，中间偏右 */}
        <div 
          className="absolute top-1/2 mt-12 md:mt-12 lg:mt-16 z-10 leading-none"
          style={{ 
            left: '60%', // 中间偏右（50% + 5%）
            transform: 'translateX(-50%)' // 以自身中心对齐
          }}
        >
          <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
            {/* Value Blueprints 标题 - 大字体，渐变文字 */}
            <h1 
              className="text-[48px] sm:text-[60px] md:text-[72px] lg:text-[80px] xl:text-[96px] font-bold leading-none tracking-[-4px] text-white"
            >
              EY.ai Value Blueprints
            </h1>

            {/* 副标题文案 */}
            <p className="text-[18px] md:text-[20px] lg:text-[24px] font-normal text-white leading-snug tracking-[-0.03em]">
              AI that drives transformational value, not more bolt-on bots
            </p>

            {/* Get Started 按钮 - 白色背景，带向下箭头图标 */}
            <button 
              onClick={onGetStartedClick}
              className="bg-white flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 lg:py-[17px] hover:bg-gray-100 transition-colors cursor-pointer w-fit"
              style={{ fontFamily: 'var(--font-eyinterstate)' }}
            >
              <span className="text-[16px] md:text-[18px] lg:text-[20px] font-normal text-black">
                Get started
              </span>
              {/* 使用 arrow-next.svg 作为向下箭头图标 */}
              <div className="flex-none w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 flex items-center justify-center">
                <img 
                  src="/images/arrow-next.svg" 
                  alt="Arrow" 
                  className="w-full h-full object-contain"
                  style={{ filter: 'brightness(0)' }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

