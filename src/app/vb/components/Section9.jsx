"use client";

export default function Section9() {
  return (
    <section
      className="relative w-full text-white pb-12 md:pb-16 lg:pb-24"
      style={{ fontFamily: 'var(--font-eyinterstate)', paddingLeft: '5%', paddingRight: '5%', paddingTop: '64px', position: 'relative', zIndex: 200, backgroundColor: '#1F1E27' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="mb-10 md:mb-12 text-center">
          <h2 
            className="text-[32px] sm:text-[48px] md:text-[64px] font-normal leading-none"
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
        </div>

        {/* 中央垂直流程 */}
        <div className="flex flex-col items-center mb-12">
          {/* Enterprise Strategy 框 */}
          <div 
            className="relative w-full max-w-[600px] md:max-w-[800px] p-4 md:p-6 flex items-center justify-center"
            style={{ backgroundColor: '#2C2B36', border: '1px solid #EAD726' }}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <img
                src="/images/value-blueprints/s9-es.svg"
                alt="Enterprise Strategy"
                className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 flex-shrink-0"
              />
              <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-normal text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                Enterprise Strategy
              </h3>
            </div>
          </div>

          {/* 向下箭头 - 紧贴 Enterprise Strategy */}
          <div className="flex justify-center" style={{ marginTop: '0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L12 20M12 20L18 14M12 20L6 14" stroke="#EAD726" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Value-led Transformation 框 */}
          <div 
            className="relative w-full max-w-[600px] md:max-w-[800px] p-6 md:p-8"
            style={{ backgroundColor: '#EAD726', marginTop: '0' }}
          >
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 text-black" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
              Value-led Transformation
            </h3>
            <p className="text-sm md:text-base lg:text-lg text-black leading-relaxed font-normal" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
              Future state definition and prioritization focuses on where value can be unlocked, leverages management hypothesis and aligns to overall enterprise vision
            </p>
          </div>

          {/* 向下箭头 - 紧贴黄色卡片 */}
          <div className="flex justify-center" style={{ marginTop: '0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L12 20M12 20L18 14M12 20L6 14" stroke="#EAD726" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* 黄色横线 */}
          <div className="w-full max-w-[1200px] h-px" style={{ backgroundColor: '#EAD726', marginTop: '0' }}></div>
        </div>

        {/* 三个步骤 - 水平排列 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 mt-2 md:mt-3">
          {/* Step 1: Context and Ambition */}
          <div 
            className="relative p-4 md:p-6"
            style={{ backgroundColor: '#2C2B36', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <div className="relative">
              <img
                src="/images/value-blueprints/s9-step1.svg"
                alt="Context and Ambition"
                className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
              />
              <div className="pl-8 md:pl-10 lg:pl-12">
                <p className="text-sm md:text-base text-white/80 mb-1" style={{ fontFamily: 'var(--font-eyinterstate)' }}>Step 1</p>
                <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-3 md:mb-4 text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  Context and Ambition
                </h3>
                <ul className="text-sm md:text-base text-white space-y-2.5 leading-relaxed list-none" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-3 mt-1.5 flex-shrink-0"></span>
                    <span>Investor grade business case to guide decision making</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-3 mt-1.5 flex-shrink-0"></span>
                    <span>Prioritize in-flight initiatives to scale and identify new, high-value opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2: Future State Processes Reimagined */}
          <div 
            className="relative p-4 md:p-6"
            style={{ backgroundColor: '#2C2B36', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <div className="relative">
              <img
                src="/images/value-blueprints/s9-step2.svg"
                alt="Future State Processes Reimagined"
                className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
              />
              <div className="pl-8 md:pl-10 lg:pl-12">
                <p className="text-sm md:text-base text-white/80 mb-1" style={{ fontFamily: 'var(--font-eyinterstate)' }}>Step 2</p>
                <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-3 md:mb-4 text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  Future State Processes Reimagined
                </h3>
                <p className="text-sm md:text-base text-white mb-3 md:mb-4 leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  Accelerate transformation through EY's Value Blueprints
                </p>
                <img
                  src="/images/value-blueprints/s9-step2.png"
                  alt="Value Blueprints"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Future State Architecture and Roadmap */}
          <div 
            className="relative p-4 md:p-6"
            style={{ backgroundColor: '#2C2B36', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <div className="relative">
              <img
                src="/images/value-blueprints/s9-step3.svg"
                alt="Future State Architecture and Roadmap"
                className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
              />
              <div className="pl-8 md:pl-10 lg:pl-12">
                <p className="text-sm md:text-base text-white/80 mb-1" style={{ fontFamily: 'var(--font-eyinterstate)' }}>Step 3</p>
                <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-3 md:mb-4 text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  Future State Architecture and Roadmap
                </h3>
                <p className="text-sm md:text-base text-white mb-3 md:mb-4 leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  Position people, data and technology to enable and thrive working in Al-first organization
                </p>
                <img
                  src="/images/value-blueprints/s9-step3.png"
                  alt="Architecture and Roadmap"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
