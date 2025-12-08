"use client";

import React from "react";

export default function Section3() {
  return (
    <section 
      className="relative w-full text-white min-h-screen py-20 pl-[5%] pr-[5%] flex items-center"
      style={{ 
        fontFamily: 'var(--font-eyinterstate)', 
        zIndex: 10, 
      }}
    >
      {/* 背景图片 - 全屏覆盖 */}
      <img 
        src="/images/value-blueprints/section3_bg.svg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: -1 }}
      />

      <div className="max-w-[1440px] mx-auto relative w-full">
        {/* 两栏布局：左侧标题模块，右侧三张卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* 左侧：标题模块 */}
          <div className="flex justify-start">
            <div className="flex items-stretch">
              {/* 垂直渐变边框 */}
              <div
                className="w-[3px]"
                style={{
                  background: 'linear-gradient(to bottom, #FFDD0B, #FF789B, #34F8FD)',
                }}
              />
              {/* 文案容器 */}
              <div className="pl-6">
                <p className="text-[28px] md:text-[48px] font-normal tracking-[-0.05em] leading-none text-[#FFE601] mb-4">
                  The Problem
                </p>
                <h2 className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white">
                  AI’s value plateau
                </h2>
              </div>
            </div>
          </div>

          {/* 右侧：三张问题卡片 */}
          <div className="flex flex-col gap-4 lg:gap-6">
            {/* 卡片 1 */}
            <div className="bg-white/10 border border-white/10 rounded-none px-4 py-4 md:px-9 md:py-9 flex items-center gap-6">
              <img
                src="/images/value-blueprints/bullet-plus.svg"
                alt="Bullet"
                className="w-6 h-6 md:w-9 md:h-9 flex-shrink-0"
              />
              <p className="text-[14px] md:text-[20px] font-normal leading-relaxed">
                Most organizations are stuck in{" "}
                <span className="font-bold text-[#FFE600]">“bolt-on AI”</span>
                {" "}– adding tools to old processes and chasing{" "}
                <span className="font-bold">incremental gains</span>.
              </p>
            </div>

            {/* 卡片 2 */}
            <div className="bg-white/10 border border-white/10 rounded-none px-4 py-4 md:px-9 md:py-9 flex items-center gap-6">
              <img
                src="/images/value-blueprints/bullet-plus.svg"
                alt="Bullet"
                className="w-6 h-6 md:w-9 md:h-9 flex-shrink-0"
              />
              <p className="text-[14px] md:text-[20px] font-normal leading-relaxed">
                <span className="font-bold">
                  Siloed initiatives, legacy frameworks, and use-case obsession
                </span>{" "}
                lead to diminishing returns and missed opportunities.
              </p>
            </div>

            {/* 卡片 3 */}
            <div className="bg-white/10 border border-white/10 rounded-none px-4 py-4 md:px-9 md:py-9 flex items-center gap-6">
              <img
                src="/images/value-blueprints/bullet-plus.svg"
                alt="Bullet"
                className="w-6 h-6 md:w-9 md:h-9 flex-shrink-0"
              />
              <div className="flex flex-col gap-1">
                <span className="text-[14px] md:text-[20px] font-bold text-[#FFE601] uppercase tracking-[0.08em]">
                  The Result
                </span>
                <p className="text-[14px] md:text-[20px] font-normal leading-relaxed">
                  Plateaued value, fragmented efforts, and unrealized potential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
