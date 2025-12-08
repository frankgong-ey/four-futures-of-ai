"use client";

export default function Section11({ scrollSectionRef }) {
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
          {/* Title Module - 与 Section10 左侧 title module 一致的样式 */}
          <div 
            className="flex items-start w-full max-w-[640px] relative"
            style={{
              opacity: 1,
            }}
          >
            {/* 垂直渐变边框 */}
            <div 
              className="w-[3px] flex-shrink-0"
              style={{
                background: 'linear-gradient(to bottom, #FFDD0B, #FF789B, #34F8FD)',
                minHeight: '200px',
                alignSelf: 'stretch',
              }}
            />
            {/* 文案容器 */}
            <div className="pl-6 relative z-10 flex-1">
              <h2 className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white mb-6 md:mb-8">
                Building toward your Agentic Enterprise
              </h2>
              
              <p 
                className="text-base sm:text-lg md:text-xl lg:text-[24px] text-white"
                style={{ 
                  fontFamily: 'var(--font-eyinterstate)',
                }}
              >
                Transform cross-functional processes, Blueprint by Blueprint to shape the Agentic Enterprise with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
