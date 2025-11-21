"use client";

import React from "react";

export default function Section3() {
  return (
    <section 
      className="relative w-full text-white py-16"
      style={{ 
        fontFamily: 'var(--font-eyinterstate)', 
        paddingLeft: '5%', 
        paddingRight: '5%', 
        position: 'relative', 
        zIndex: 10, 
        backgroundColor: '#000000' 
      }}
    >
      <div className="max-w-[1440px] mx-auto relative">
        {/* 标题 - 屏幕中间偏右侧，左对齐，80px，从白色到黄色渐变 */}
        <div className="flex justify-start max-w-[640px]">
            <h2 
              className="text-[36px] md:text-[64px] font-normal leading-none mb-8 text-left tracking-[-0.05em]"
              style={{
                background: 'linear-gradient(to right, white, #EAD726)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Two paths to tackling the AI opportunity
            </h2>
        </div>

        {/* 路径图表区域 - 响应式布局 */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-8">
          {/* 左侧：SVG 图表 */}
          <div className="flex-1 flex items-center justify-center lg:justify-start">
            <img 
              src="/images/value-blueprints/arrows3.svg" 
              alt="Paths"
              className="w-full h-auto object-contain"
              style={{ maxWidth: '971px', maxHeight: '719px' }}
            />
          </div>

          {/* 右侧：两个卡片 */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Built-in AI 卡片 */}
            <div className="bg-white/10 p-6 rounded-none border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src="/images/value-blueprints/built-in3.svg" 
                  alt="Built-in AI"
                  className="w-12 h-12 flex-shrink-0"
                />
                <h3 className="text-[20px] font-bold text-white">Built-in AI</h3>
              </div>
              <ul className="space-y-3 text-[16px] md:text-[18px] text-white leading-relaxed" style={{ listStyle: 'none' }}>
                <li className="flex items-start gap-3">
                  <span>•</span>
                  <span>Fundamentally re-imagine your workflows with product and consumer experience in mind</span>
                </li>
                <li className="flex items-start gap-3">
                  <span>•</span>
                  <span>Reimagine enterprise value proposition</span>
                </li>
                <li className="flex items-start gap-3">
                  <span>•</span>
                  <span>Develop new products, services, or enter underserved markets</span>
                </li>
              </ul>
            </div>

            {/* Bolt-on AI 卡片 */}
            <div className="bg-white/5 p-6 rounded-none border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src="/images/value-blueprints/bolt-on3.svg" 
                  alt="Bolt-on AI"
                  className="w-12 h-12 flex-shrink-0"
                />
                <h3 className="text-[20px] font-bold text-white">Bolt-on AI</h3>
              </div>
              <ul className="space-y-3 text-[16px] md:text-[18px] text-white leading-relaxed" style={{ listStyle: 'none' }}>
                <li className="flex items-start gap-3">
                  <span>•</span>
                  <span>Focus on efficiencies with limited top line impact</span>
                </li>
                <li className="flex items-start gap-3">
                  <span>•</span>
                  <span>Typically enabled by chatbots and automated generation of textual content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span>•</span>
                  <span>Slow to scale and fully realize value potential</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
