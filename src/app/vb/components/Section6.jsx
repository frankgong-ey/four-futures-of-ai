export default function Section6() {
  return (
    <section
      className="relative w-full text-white py-12 md:py-16 lg:py-24"
      style={{ fontFamily: 'var(--font-eyinterstate)', paddingLeft: '5%', paddingRight: '5%', position: 'relative', zIndex: 200, backgroundColor: '#1F1E27' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <h2 
          className="text-[32px] sm:text-[48px] md:text-[64px] font-normal leading-none mb-8 md:mb-12 text-center"
          style={{
            letterSpacing: '-0.05em',
            background: 'linear-gradient(to right, white, #EAD726)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'var(--font-eyinterstate)'
          }}
        >
          Proven EY methodology created a library of Ready Value Blueprints
        </h2>

        {/* 上半部分：4列步骤说明 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 border-t border-white/20 pt-8 md:pt-12 mb-12 md:mb-16">
          <div className="pr-0 md:pr-8">
            <h3 className="text-[20px] sm:text-[24px] md:text-[28px] font-semibold mb-3">Value-led Transformation</h3>
            <p className="text-sm md:text-sm text-gray-300 leading-relaxed">
              Focus on where value can be unlocked and gained throughout the design and
              prioritization of the future state.
            </p>
          </div>

          <div className="border-l-0 md:border-l border-white/20 pl-0 md:pl-8 border-t md:border-t-0 pt-6 md:pt-0">
            <p className="text-sm text-gray-400 mb-2">Step 1</p>
            <h3 className="text-base md:text-lg font-semibold mb-3">Context and Ambition</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Understand where the business is most ready to adopt agentic powered ways of
              operating for the future.
            </p>
          </div>

          <div className="border-l-0 md:border-l border-white/20 pl-0 md:pl-8 border-t md:border-t-0 pt-6 md:pt-0 lg:border-t-0 lg:pt-0">
            <p className="text-sm text-gray-400 mb-2">Step 2</p>
            <h3 className="text-base md:text-lg font-semibold mb-3">
              Future State Process
              <br />
              reimagined
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Reimagine how we think about structuring work to accomplish business outcomes.
            </p>
          </div>

          <div className="border-l-0 md:border-l border-white/20 pl-0 md:pl-8 border-t md:border-t-0 pt-6 md:pt-0 lg:border-t-0 lg:pt-0">
            <p className="text-sm text-gray-400 mb-2">Step 3</p>
            <h3 className="text-base md:text-lg font-semibold mb-3">
              Future State Architecture
              <br />
              and Roadmap
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Position people, data and technology to enable and thrive working with new agentic
              capability.
            </p>
          </div>
        </div>

        {/* 下半部分：EY Ready Value Blueprints 模块 */}
        <div 
          className="relative"
          style={{
            background: 'linear-gradient(to right, #2C2B36, #BC991A)',
            minHeight: '300px',
            outline: 'none' // 移除默认的 outline
          }}
        >
          {/* 左侧：标题和文本网格 */}
          <div 
            className="p-6 md:p-8 lg:p-12 flex flex-col" 
            style={{ 
              maxWidth: '100%', 
              width: '100%',
              position: 'relative',
              zIndex: 10
            }}
          >
            {/* 标题 */}
            <div className="mb-6 md:mb-8">
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">EY Ready Value Blueprints</p>
            </div>

            {/* 3x3 文本网格 - 响应式：移动端2列，桌面端3列 */}
            <div 
              className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 flex-1"
              style={{
                maxWidth: '640px',
                marginLeft: 0,
                marginRight: 'auto',
                position: 'relative',
                zIndex: 10
              }}
            >
              {[
                'Inspire to Buy',
                'Plan to Deliver',
                'Hire to Retire',
                'Record to Report',
                'Order to Cash',
                'Transact to Transform',
                'Engage to Advocate',
                'Innovate to Scale',
                'Develop Purpose, Vision and Strategy',
              ].map((label, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center border border-white/20 p-3 md:p-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <p className="text-xs sm:text-sm text-center text-white leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：抽象图形 - 响应式定位 */}
          <img
            src="/images/value-blueprints/texture.png"
            alt="Value Blueprints Texture"
            className="hidden md:block absolute h-auto object-contain"
            style={{
              right: '24px',
              bottom: '0',
              maxHeight: '300px',
              maxWidth: 'calc(50% - 24px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              zIndex: 1
            }}
          />
        </div>
      </div>
    </section>
  );
}

