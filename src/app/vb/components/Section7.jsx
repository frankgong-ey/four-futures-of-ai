"use client";

import React from "react";

export default function Section7({ onRiskAssessmentClick }) {
  return (
    <section
      className="relative w-full text-white py-12 md:py-16 lg:py-24"
      style={{ fontFamily: 'var(--font-eyinterstate)', paddingLeft: '5%', paddingRight: '5%', position: 'relative', zIndex: 200, backgroundColor: '#1F1E27' }}
    >
      {/* 所有子元素包裹在一个背景为 #2C2B36 的大 div container 中 */}
      <div 
        className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12 min-h-[300px] md:min-h-[400px] lg:min-h-[480px]"
        style={{ backgroundColor: '#2C2B36' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {/* 左侧内容区域 - 占据2/3宽度 */}
          <div className="lg:col-span-2 max-w-full lg:max-w-[640px]">
            {/* 小标题 */}
            <p 
              className="text-sm sm:text-base md:text-[18px] mb-4 md:mb-6"
              style={{
                color: '#EAD726',
                fontFamily: 'var(--font-eyinterstate)'
              }}
            >
              Value Blueprints in Action
            </p>
            
            {/* 大标题 - 整体从左到右从白色到黄色的渐变 */}
            <h2 
              className="text-[32px] sm:text-[48px] md:text-[64px] font-normal leading-none mb-6 md:mb-8"
              style={{ 
                fontFamily: 'var(--font-eyinterstate)',
                letterSpacing: '-0.05em',
                background: 'linear-gradient(to right, white, #EAD726)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              What does it mean for you?
            </h2>
            
            {/* 描述文字 */}
            <p className="text-sm md:text-base lg:text-[18px] text-white max-w-full lg:max-w-xl leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
              An agentic enterprise turns <span className="font-semibold">efficiency into opportunity</span> – enabling
              new revenue streams, new business models, and driving innovative customer experiences
              previously beyond our imagination.
            </p>
          </div>

          {/* 右侧 Success Stories 列表 - 占据1/3宽度 */}
          <div className="flex flex-col gap-3 md:gap-4">
            {/* 标题 */}
            <p className="font-normal text-lg sm:text-xl md:text-[24px] text-white mb-3 md:mb-4" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
              Check out our Success Stories
            </p>
            
            {/* 卡片列表 */}
            {[
              { title: "EY's Risk Assessment" },
              { title: "Fossil's Watch Design" },
              { title: "Life Sciences Global Conglomerate Order-to-Cash" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-200 border border-white px-4 md:px-6 py-4 md:py-6"
                style={{ fontFamily: 'var(--font-eyinterstate)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm sm:text-base md:text-[18px] font-normal flex-1 text-black">
                    {item.title}
                  </div>
                  <div className="text-black text-xl sm:text-2xl md:text-[32px] ml-2 md:ml-4 flex-shrink-0">›</div>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 italic">
                  Work in progress
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

