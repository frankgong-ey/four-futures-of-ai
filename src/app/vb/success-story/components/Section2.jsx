"use client";

import React from "react";

export default function Section2() {
  return (
    <section className="relative w-full text-white flex items-center" style={{ position: 'relative', zIndex: 5, minHeight: '100vh', paddingTop: '80px', paddingBottom: '80px', paddingLeft: '64px', paddingRight: '64px', backgroundColor: '#1F1E27' }}>
      <div className="flex flex-col lg:flex-row w-full mx-auto gap-16 items-center" style={{ maxWidth: '1592px' }}>
        {/* 左列：黑色背景 */}
        <div className="w-full lg:w-1/2">
          <div className="flex flex-col">
            {/* 标题 */}
            <h2 
              className="text-[48px] font-bold text-white mb-8 md:mb-12 leading-none"
              style={{ 
                fontFamily: 'var(--font-eyinterstate)',
                letterSpacing: '-0.05em',
              }}
            >
              How doing different things, drove outsized value
            </h2>

            {/* 三个卡片 - 垂直堆叠 */}
            <div className="flex flex-col gap-6 mb-8">
              {/* 卡片 1: 成本节省 */}
              <div className="bg-white/5 border border-white/20 p-6 md:p-8 flex items-center gap-6">
                {/* 图标 */}
                <img 
                  src="/images/value-blueprints/ss-tf-cost.svg" 
                  alt="Cost savings"
                  className="flex-shrink-0"
                  style={{ width: '36px', height: '36px' }}
                />
                <p className="text-[24px] text-white font-normal leading-tight">
                  <span className="font-bold text-[#FFE601]">30% cost savings opportunity</span> in the end-to-end process
                </p>
              </div>

              {/* 卡片 2: 生产力提升 */}
              <div className="bg-white/5 border border-white/20 p-6 md:p-8 flex items-center gap-6">
                {/* 图标 */}
                <img 
                  src="/images/value-blueprints/ss-tf-productivity.svg" 
                  alt="Productivity"
                  className="flex-shrink-0"
                  style={{ width: '36px', height: '36px' }}
                />
                <p className="text-[24px] text-white font-normal leading-tight" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  <span className="font-bold text-[#FFE601]">40% productivity gains</span> enabling greater worker efficiency
                </p>
              </div>

              {/* 卡片 3: 系统转型 */}
              <div className="bg-white/5 border border-white/20 p-6 md:p-8 flex items-center gap-6">
                {/* 图标 */}
                <img 
                  src="/images/value-blueprints/ss-tf-system.svg" 
                  alt="Systems"
                  className="flex-shrink-0"
                  style={{ width: '36px', height: '36px' }}
                />
                <p className="text-[24px] text-white font-normal leading-tight" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  <span className="font-bold text-[#FFE601]">Transforming within the existing landscape</span> of enterprise systems
                </p>
              </div>
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
                className="text-[48px] font-bold text-white mb-8 md:mb-12 leading-none"
                style={{ 
                  fontFamily: 'var(--font-eyinterstate)',
                  letterSpacing: '-0.05em',
                }}
              >
                What this means for our agentic enterprise
              </h2>

              {/* 两个机会信息块 */}
              <div className="flex flex-col gap-6">
                {/* 信息块 1 */}
                <div className="flex items-center gap-6">
                  <img 
                    src="/images/value-blueprints/bullet-plus.svg" 
                    alt="Bullet"
                    className="flex-shrink-0"
                    style={{ width: '36px', height: '36px' }}
                  />
                  <p className="text-[24px] text-white font-normal leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                    Opportunities to create greater value by <span className="font-bold text-[#FFE601]">re-thinking how we organize work</span> across teams
                  </p>
                </div>

                {/* 信息块 2 */}
                <div className="flex items-center gap-6">
                  <img 
                    src="/images/value-blueprints/bullet-plus.svg" 
                    alt="Bullet"
                    className="flex-shrink-0"
                    style={{ width: '36px', height: '36px' }}
                  />
                  <p className="text-[24px] text-white font-normal leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                    Opportunities for AI to <span className="font-bold text-[#FFE601]">work across systems landscapes</span>...instead of defaulting to replacement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

