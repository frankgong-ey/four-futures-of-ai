"use client";

import React from "react";

export default function Section10() {
  const crossFunctionalTeams = [
    {
      title: "Value",
      description: "Identify, quantify and track value driven by reimagined processes",
    },
    {
      title: "Business",
      description: "Strategic understanding with process expertise",
    },
    {
      title: "Data & AI",
      description: "Strategic approach and expertise to data and AI capabilities",
    },
    {
      title: "Technology",
      description: "Leverage tech platforms to enable scalable, secure, and efficient delivery",
    },
    {
      title: "Change",
      description: "Drive adoption and behavioral change to embed new ways of working",
    },
  ];

  return (
    <section
      className="relative w-full text-white"
      style={{ 
        fontFamily: 'var(--font-eyinterstate)', 
        backgroundColor: '#1F1E27',
        minHeight: '200vh',
        position: 'relative',
        zIndex: 200,
      }}
    >
      <div className="flex flex-col lg:flex-row relative w-full">
        {/* 左侧：Sticky Title Module */}
        <div 
          className="w-full lg:w-auto xl:max-w-[640px] lg:max-w-[400px] flex items-center lg:items-center pl-[5%] pr-[5%] lg:pr-0 relative lg:sticky lg:top-0 lg:self-start py-8 lg:py-0 lg:!min-h-screen"
          style={{
            minHeight: 'auto',
            zIndex: 20,
          }}
        >
          <div className="flex items-center w-full">
            {/* 垂直渐变边框 */}
            <div 
              className="w-[3px] h-auto lg:h-full lg:!min-h-[200px] flex-shrink-0 self-stretch lg:self-auto"
              style={{
                background: 'linear-gradient(to bottom, #FFDD0B, #FF789B, #34F8FD)',
              }}
            />
            {/* 文案容器 */}
            <div className="pl-6">
              <p className="text-[28px] md:text-[48px] font-normal tracking-[-0.05em] leading-none text-[#FFE601] mb-4">
                Getting Started
              </p>
              <h2 className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white">
                EY's Strategy Diagnostic
              </h2>
            </div>
          </div>
        </div>

        {/* 右侧：两个 Subsection */}
        <div className="flex-1 pr-[5%] pl-[5%] xl:pl-8 relative z-10">
          {/* 第一个 Subsection: Value Blueprints & Cross-Functional Teams */}
          <div 
            className="flex flex-col justify-center py-20"
            style={{
              minHeight: '100vh',
              paddingTop: '80px',
              paddingBottom: '80px',
            }}
          >
            {/* 分割线 */}
            <div className="w-full h-px bg-white/20 mb-12"></div>
            
            {/* Value Blueprints */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* 左侧：文字内容 */}
                <div>
                  <h3 className="text-[24px] md:text-[32px] font-bold text-white mb-4 tracking-[-0.02em]">
                    EY.ai Value Blueprints
                  </h3>
                  <p className="text-[16px] md:text-[20px] text-white leading-relaxed">
                    Ready to be tailored with context to industry.
                  </p>
                </div>
                {/* 右侧：图片 */}
                <div className="flex items-center justify-end">
                  <img
                    src="/images/value-blueprints/section10_vb.svg"
                    alt="Value Blueprints"
                    className="w-auto object-contain"
                    style={{
                      height: '180px',
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* 分割线 */}
            <div className="w-full h-px bg-white/20 mb-12"></div>

            {/* Cross-Functional Teams */}
            <div>
              <h3 className="text-[24px] md:text-[32px] font-bold text-white mb-4 tracking-[-0.05em]">
                Cross-Functional Teams
              </h3>
              <p className="text-[16px] md:text-[20px] text-white leading-relaxed mb-6">
                Focused on 5 strategic outcomes.
              </p>
              
              {/* 5 个卡片网格 - 3 个在上排，2 个在下排 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[900px]">
                {/* 第一排：3 个卡片 */}
                {crossFunctionalTeams.slice(0, 3).map((team, index) => (
                  <div
                    key={index}
                    className="bg-[#2C2B36] border border-white/10 rounded-none p-4 md:p-6 flex flex-col items-start gap-3"
                  >
                    {/* 第一行：Icon 和 Title 左右分布 */}
                    <div className="flex items-center gap-2">
                      {/* Icon */}
                      <img
                        src="/images/value-blueprints/bullet-plus.svg"
                        alt="Bullet"
                        className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0"
                      />
                      {/* Title */}
                      <p className="text-white text-[14px] md:text-[16px] font-semibold">
                        {team.title}
                      </p>
                    </div>
                    {/* 第二行：Description 文本，左对齐 */}
                    <p className="text-white/80 text-[12px] md:text-[14px] leading-relaxed">
                      {team.description}
                    </p>
                  </div>
                ))}
                {/* 第二排：2 个卡片，从左边开始 */}
                {crossFunctionalTeams.slice(3, 5).map((team, index) => (
                  <div
                    key={index + 3}
                    className="bg-[#2C2B36] border border-white/10 rounded-none p-4 md:p-6 flex flex-col items-start gap-3"
                  >
                    {/* 第一行：Icon 和 Title 左右分布 */}
                    <div className="flex items-center gap-2">
                      {/* Icon */}
                      <img
                        src="/images/value-blueprints/bullet-plus.svg"
                        alt="Bullet"
                        className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0"
                      />
                      {/* Title */}
                      <p className="text-white text-[14px] md:text-[16px] font-semibold">
                        {team.title}
                      </p>
                    </div>
                    {/* 第二行：Description 文本，左对齐 */}
                    <p className="text-white/80 text-[12px] md:text-[14px] leading-relaxed">
                      {team.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 分割线 */}
          <div className="w-full h-px bg-white/20"></div>

          {/* 第二个 Subsection: 简化版流程图 */}
          <div 
            className="flex flex-col justify-center py-20"
            style={{
              minHeight: '100vh',
              paddingTop: '80px',
              paddingBottom: '80px',
            }}
          >
            {/* Enterprise Strategy */}
            <div className="mb-0 flex justify-center">
              <div 
                className="bg-[#2C2B36] border border-[#EAD726] rounded-none p-4 md:p-6 flex items-center justify-center gap-4"
                style={{ maxWidth: '600px', width: '100%' }}
              >
                <img
                  src="/images/value-blueprints/s9-es.svg"
                  alt="Enterprise Strategy"
                  className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
                />
                <h3 className="text-[18px] md:text-[24px] font-bold text-white text-center">
                  Enterprise Strategy
                </h3>
              </div>
            </div>

            {/* 向下箭头 - 白色 */}
            <div className="mb-0 flex justify-center">
              <svg width="32" height="48" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 竖线 - butt cap */}
                <path d="M12 4L12 28" stroke="white" strokeWidth="2.5" strokeLinecap="butt"/>
                {/* 箭头 - rounded cap */}
                <path d="M12 28L18 22M12 28L6 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Value-led Transformation */}
            <div className="mb-0 flex justify-center">
              <div 
                className="bg-[#EAD726] rounded-none p-6 md:p-8 flex items-center justify-center"
                style={{ maxWidth: '600px', width: '100%' }}
              >
                <h3 className="text-[24px] md:text-[32px] font-bold text-black text-center" style={{ letterSpacing: '-0.05em' }}>
                  Value-led Transformation
                </h3>
              </div>
            </div>

            {/* 向下箭头 - 白色 */}
            <div className="mb-0 flex justify-center">
              <svg width="32" height="48" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 竖线 - butt cap */}
                <path d="M12 4L12 28" stroke="white" strokeWidth="2.5" strokeLinecap="butt"/>
                {/* 箭头 - rounded cap */}
                <path d="M12 28L18 22M12 28L6 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* 黄色横线分隔 */}
            <div className="flex justify-center" style={{ marginBottom: '24px' }}>
              <div 
                className="h-px bg-[#EAD726]"
                style={{ maxWidth: '900px', width: '100%' }}
              ></div>
            </div>

            {/* 三个步骤 - 水平排列 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6" style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '48px' }}>
              {/* Step 1 - 橙色 */}
              <div 
                className="bg-[#2C2B36] border border-white/10 rounded-none p-4 md:p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-8 h-8 flex-shrink-0"
                    style={{
                      maskImage: 'url(/images/value-blueprints/s9-step1.svg)',
                      WebkitMaskImage: 'url(/images/value-blueprints/s9-step1.svg)',
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      backgroundColor: '#E87729',
                    }}
                  ></div>
                  <p 
                    className="text-sm md:text-base font-bold"
                    style={{ color: '#E87729' }}
                  >
                    Step 1
                  </p>
                </div>
                <h4 className="text-white text-base md:text-lg font-normal">
                  Context and Ambition
                </h4>
              </div>

              {/* Step 2 - 粉色 */}
              <div 
                className="bg-[#2C2B36] border border-white/10 rounded-none p-4 md:p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-8 h-8 flex-shrink-0"
                    style={{
                      maskImage: 'url(/images/value-blueprints/s9-step2.svg)',
                      WebkitMaskImage: 'url(/images/value-blueprints/s9-step2.svg)',
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      backgroundColor: '#D85978',
                    }}
                  ></div>
                  <p 
                    className="text-sm md:text-base font-bold"
                    style={{ color: '#D85978' }}
                  >
                    Step 2
                  </p>
                </div>
                <h4 className="text-white text-base md:text-lg font-normal">
                  Future State Processes Reimagined
                </h4>
              </div>

              {/* Step 3 - 浅蓝色 */}
              <div 
                className="bg-[#2C2B36] border border-white/10 rounded-none p-4 md:p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-8 h-8 flex-shrink-0"
                    style={{
                      maskImage: 'url(/images/value-blueprints/s9-step3.svg)',
                      WebkitMaskImage: 'url(/images/value-blueprints/s9-step3.svg)',
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      backgroundColor: '#59A0F0',
                    }}
                  ></div>
                  <p 
                    className="text-sm md:text-base font-bold"
                    style={{ color: '#59A0F0' }}
                  >
                    Step 3
                  </p>
                </div>
                <h4 className="text-white text-base md:text-lg font-normal">
                  Future State Architecture and Roadmap
                </h4>
              </div>
            </div>

            {/* 底部定义文本 */}
            <div className="text-left" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <p className="text-white font-normal leading-relaxed" style={{ fontSize: '24px' }}>
                A <span className="font-bold" style={{ color: '#EAD726' }}>value-led transformation</span> quantifies the benefits of reimagined processes, creates a practical playbook to prioritize initiatives and establishes a <span className="font-bold" style={{ color: '#EAD726' }}>self-funding program</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
