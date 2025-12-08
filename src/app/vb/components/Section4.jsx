"use client";

import React from "react";

export default function Section4() {
  return (
    <section 
      className="relative w-full text-white min-h-screen py-20 pl-[5%] pr-[5%] flex items-center"
      style={{ 
        fontFamily: 'var(--font-eyinterstate)', 
        zIndex: 10, 
        backgroundColor: '#111118',
      }}
    >
      <div className="max-w-[1440px] mx-auto relative w-full">
        {/* 顶部标题区域 - 与 Section2 一致的布局/尺寸 */}
        <div className="max-w-4xl mx-auto text-center mb-16 flex flex-col items-center gap-4">
          <p className="text-[28px] md:text-[48px] font-normal tracking-[-0.05em] leading-none text-[#FFE601]">
            The Opportunity
          </p>
          <h2 
            className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white"
          >
            Reimagine with AI at the core
          </h2>
          <div 
            className="w-40 h-[3px] mx-auto"
            style={{
              background: 'linear-gradient(to right, #FFDD0B, #FF789B, #34F8FD)',
            }}
          />
        </div>

        {/* 下方两张卡片：大屏左右布局，小屏上下堆叠 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* 左侧卡片：Bolt-on AI */}
          <div className="border border-white/10 rounded-none p-6 md:p-8 flex flex-col gap-6">
            {/* 标题与副标题 */}
            <div className="text-center flex flex-col items-center">
              <h3 className="inline-block text-[24px] md:text-[48px] font-bold tracking-[-0.03em]">
                Bolt-on AI
              </h3>
              <p className="inline-block text-[16px] md:text-[24px] font-bold text-white/80">
                “Doing things differently”
              </p>
            </div>

            {/* 中间示意图 */}
            <div className="flex justify-center">
              <img
                src="/images/value-blueprints/section4_1.svg"
                alt="Bolt-on AI diagram"
                className="h-[160px] w-auto object-contain"
              />
            </div>

            {/* bullet 区域 */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-3">
                <img
                  src="/images/value-blueprints/bullet-plus.svg"
                  alt="Bullet"
                  className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 translate-y-1"
                />
                <p className="text-[14px] md:text-[18px] font-normal leading-relaxed">
                  Applying AI to existing processes (e.g., chatbots).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <img
                  src="/images/value-blueprints/bullet-plus.svg"
                  alt="Bullet"
                  className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 translate-y-1"
                />
                <p className="text-[14px] md:text-[18px] font-normal leading-relaxed">
                  Drives operational efficiency, but value is only found within the constraints of the process.
                </p>
              </div>
            </div>
          </div>

          {/* 右侧卡片：Built-in AI */}
          <div className="bg-[#181820] border border-white/10 rounded-none p-6 md:p-8 flex flex-col gap-6">
            {/* 标题与副标题 */}
            <div className="text-center flex flex-col items-center">
              <h3 
                className="inline-block text-[24px] md:text-[48px] font-bold tracking-[-0.03em]"
                style={{
                  background: 'linear-gradient(to right, #59A0F0, #D85978, #FEE404)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Built-in AI
              </h3>
              <p 
                className="inline-block text-[16px] md:text-[24px] font-bold"
                style={{
                  background: 'linear-gradient(to right, #59A0F0, #D85978, #FEE404)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                “Doing different things”
              </p>
            </div>

            {/* 中间示意图 */}
            <div className="flex justify-center">
              <img
                src="/images/value-blueprints/section4_2.svg"
                alt="Built-in AI diagram"
                className="h-[160px] w-auto object-contain"
              />
            </div>

            {/* bullet 区域 */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-3">
                <img
                  src="/images/value-blueprints/bullet-plus.svg"
                  alt="Bullet"
                  className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 translate-y-1"
                />
                <p className="text-[14px] md:text-[18px] font-normal leading-relaxed">
                  Reimagining workflows, products, and business models with AI as the baseline.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <img
                  src="/images/value-blueprints/bullet-plus.svg"
                  alt="Bullet"
                  className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 translate-y-1"
                />
                <p className="text-[14px] md:text-[18px] font-normal leading-relaxed">
                  Unlocking value through new revenue streams, business models, and customer experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

