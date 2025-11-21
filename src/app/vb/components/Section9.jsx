export default function Section9() {
  return (
    <section
      className="relative w-full text-white py-12 md:py-16 lg:py-24"
      style={{ fontFamily: 'var(--font-eyinterstate)', paddingLeft: '5%', paddingRight: '5%', position: 'relative', zIndex: 200, backgroundColor: '#1F1E27' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="mb-10 md:mb-12 lg:mb-16">
          <h2 
            className="text-[32px] sm:text-[48px] md:text-[64px] font-normal leading-none mb-4 md:mb-6"
            style={{ 
              fontFamily: 'var(--font-eyinterstate)',
              letterSpacing: '-0.05em',
              background: 'linear-gradient(to right, white, #EAD726)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Our diagnostic approach
          </h2>
          <p className="text-sm md:text-base lg:text-[18px] text-white leading-relaxed max-w-full lg:max-w-3xl" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
            An agentic enterprise turns <span className="font-semibold">efficiency into opportunity</span> – enabling new revenue
            streams, new business models, and driving innovative customer experiences previously
            beyond our imagination.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {/* 左侧两块文本卡片 */}
          <div className="space-y-4 md:space-y-6">
            {/* 卡片 1: Prepare the race */}
            <div 
              className="p-4 md:p-6 bg-white/5"
              style={{ borderLeft: '2px solid #27ACAA' }}
            >
              <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                <img
                  src="/images/value-blueprints/prepare.svg"
                  alt="Prepare"
                  className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold mb-2 text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                    1. Prepare the race
                  </h3>
                  <p className="text-lg md:text-xl lg:text-[24px] font-semibold mb-2 md:mb-3 text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                    Strategic Diagnostic
                  </p>
                  <ul className="text-sm md:text-base text-white space-y-2 md:space-y-4 leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                    <li>• Prioritize in-flight initiatives to continue and scale</li>
                    <li>• Identify new, high-value opportunities</li>
                    <li>• Guide decision making through an investor grade business case</li>
                    <li>• Activate the organization and the market through additional supporting assets</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 卡片 2: Win the race */}
            <div 
              className="p-4 md:p-6 bg-white/5"
              style={{ borderLeft: '2px solid #EAD726' }}
            >
              <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                <img
                  src="/images/value-blueprints/win.svg"
                  alt="Win"
                  className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold mb-2 text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                    2. Win the race
                  </h3>
                  <p className="text-lg md:text-xl lg:text-[24px] font-semibold mb-2 md:mb-3 text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                    EY Value Blueprints
                  </p>
                  <ul className="text-sm md:text-base text-white space-y-2 leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                    <li>• Accelerate transformation through EY Ready Value Blueprints: Leverage our existing products that gets you 60-70% of the way there</li>
                    <li>• Drive your competitive advantage through EY Custom Value Blueprints: Utilize proven methodology to develop tailored blueprint to your enterprise</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧图片区域 */}
          <div className="flex items-center justify-center">
            <img
              src="/images/value-blueprints/section8.png"
              alt="Diagnostic Approach Chart"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

