"use client";

import React from "react";

export default function Section2({ storyData }) {
  return (
    <section className="relative w-full text-white flex items-center py-10 px-4 md:py-20 md:px-16" style={{ position: 'relative', zIndex: 5, minHeight: '100vh', backgroundColor: '#1F1E27' }}>
      <div className="flex flex-col lg:flex-row w-full mx-auto gap-16 items-center" style={{ maxWidth: '1592px' }}>
        {/* 左列：黑色背景 */}
        <div className="w-full lg:w-1/2">
          <div className="flex flex-col">
            {/* 标题 */}
            <h2 
              className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-white mb-6 md:mb-8 lg:mb-12 leading-none"
              style={{ 
                fontFamily: 'var(--font-eyinterstate)',
                letterSpacing: '-0.05em',
              }}
            >
              {storyData.section2.leftTitle}
            </h2>

            {/* 三个卡片 - 垂直堆叠 */}
            <div className="flex flex-col gap-6 mb-8">
              {storyData.section2.leftCards.map((card, index) => (
                <div key={index} className="bg-white/5 border border-white/20 p-6 md:p-8 flex items-center gap-6">
                {/* 图标 */}
                <img 
                    src={card.icon} 
                    alt=""
                  className="flex-shrink-0 md:w-9 md:h-9"
                  style={{ width: '28px', height: '28px' }}
                />
                <p className="text-[18px] md:text-[20px] lg:text-[24px] text-white font-normal leading-tight" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                    {card.text && <>{card.text} </>}
                    <span className="font-bold text-[#FFE601]">{card.highlight}</span>
                    {card.fullText && <> {card.fullText}</>}
                </p>
              </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右列：垂直居中 */}
        <div className="w-full lg:w-1/2 relative">
          {/* 右侧内容容器 */}
          <div className="bg-white/5 border border-white/20 relative">
            {/* 上边缘渐变色条 */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background: 'linear-gradient(to right, #FFDD0B, #FF789B, #34F8FD)',
              }}
            />
            
            {/* 内容 */}
            <div className="flex flex-col px-6 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
              {/* 标题 */}
              <h2 
                className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-white mb-6 md:mb-8 lg:mb-12 leading-none"
                style={{ 
                  fontFamily: 'var(--font-eyinterstate)',
                  letterSpacing: '-0.05em',
                }}
              >
                {storyData.section2.rightTitle}
              </h2>

              {/* 两个机会信息块 */}
              <div className="flex flex-col gap-6">
                {storyData.section2.rightItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-6">
                  <img 
                    src="/images/value-blueprints/bullet-plus.svg" 
                    alt="Bullet"
                    className="flex-shrink-0 md:w-9 md:h-9"
                    style={{ width: '28px', height: '28px' }}
                  />
                  <p className="text-[18px] md:text-[20px] lg:text-[24px] text-white font-normal leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                      {item.text} <span className="font-bold text-[#FFE601]">{item.highlight}</span> {item.fullText}
                  </p>
                </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

