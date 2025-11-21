"use client";

import React from "react";

export default function Section8({ scrollSectionRef }) {
  return (
    <section
      ref={scrollSectionRef}
      className="relative w-full text-white"
      style={{ height: '300vh', fontFamily: 'var(--font-eyinterstate)', backgroundColor: '#000000' }}
    >
      {/* HTML 内容显示 - sticky定位，覆盖在Canvas之上 */}
      <div 
        className="pointer-events-none sticky top-0"
        style={{ 
          height: 0, // 不占据文档流高度
          width: '100%',
          zIndex: 100, // 提高z-index，确保在Canvas之上
        }}
      >
        {/* 内容包装器 - 绝对定位，覆盖整个视口 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: '5%',
            paddingRight: '5%',
            pointerEvents: 'none',
          }}
        >
          {/* 标题和文字 */}
          <div 
            className="px-4 sm:px-6 md:px-8"
            style={{
              opacity: 1,
              textAlign: 'left',
              maxWidth: '640px',
              width: '100%',
            }}
          >
            <h1 
              className="text-[32px] sm:text-[48px] md:text-[64px] font-normal leading-none mb-6 md:mb-8 tracking-[-0.05em]"
              style={{ 
                background: 'linear-gradient(to right, white, #EAD726)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--font-eyinterstate)' 
              }}
            >
              Building toward your Agentic Enterprise
            </h1>
            
            <p 
              className="text-base sm:text-lg md:text-xl lg:text-[24px]"
              style={{ 
                color: '#ffffff', 
                fontFamily: 'var(--font-eyinterstate)',
                opacity: 1,
              }}
            >
              Transform cross-functional processes, Blueprint by Blueprint to shape the Agentic Enterprise with confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

