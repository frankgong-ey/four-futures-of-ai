'use client';

import { forwardRef, useRef, useState, useEffect } from 'react';

// Quotes Carousel组件
function QuotesCarousel() {
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 易于管理的quotes数据
  const quotes = [
    {
      text: "The looming AI monopolies",
      source: "Politico",
      year: "2024"
    },
    {
      text: "OpenAI's Sam Altman predicts artificial superintelligence (AGI) by 2025",
      source: "Tech Radar", 
      year: "2024"
    },
    {
      text: "OpenAI's $10 Million+ AI Consulting Business: Deployment Takes Center Stage",
      source: "Forbes",
      year: "2025"
    },
    {
      text: "How will you respond when AI agents reshape your firm's business model?",
      source: "Accounting Today",
      year: "2025"
    },
    {
      text: "AI will transform every industry, but the question is how quickly and who will lead",
      source: "MIT Technology Review",
      year: "2024"
    },
    {
      text: "The future belongs to those who can harness AI's potential while managing its risks",
      source: "Harvard Business Review",
      year: "2025"
    },
    {
      text: "We're not just building tools, we're creating the next generation of intelligence",
      source: "Nature AI",
      year: "2024"
    }
  ];

  // 自动滚动效果
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 3000); // 每3秒切换一次

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 flex flex-col justify-center">
        {quotes.map((quote, index) => {
          // 计算当前quote在可视区域中的位置
          const relativeIndex = (index - currentIndex + quotes.length) % quotes.length;
          const isVisible = relativeIndex <= 4; // 显示当前及前后4个（总共5个）
          
          if (!isVisible) return null;

          // 计算透明度和位置
          let opacity = 0;
          let translateY = 0;
          
          if (relativeIndex === 0) {
            // 上方待消失的quote（低透明度）
            opacity = 0.3;
            translateY = -160;
          } else if (relativeIndex === 1) {
            // 第一个高亮quote
            opacity = 1;
            translateY = -60;
          } else if (relativeIndex === 2) {
            // 第二个高亮quote
            opacity = 1;
            translateY = 60;
          } else if (relativeIndex === 3) {
            // 下方待高亮的quote（低透明度）
            opacity = 0.3;
            translateY = 160;
          } else if (relativeIndex === 4) {
            // 第五个quote（完全透明）
            opacity = 0;
            translateY = 260;
          }

          return (
            <div
              key={index} // 使用固定的index作为key，让React复用DOM元素
              className="absolute w-full transition-all ease-out"
              style={{
                transform: `translateY(${translateY}px)`,
                opacity: opacity,
                zIndex: quotes.length - relativeIndex,
                transitionDuration: '1000ms'
              }}
            >
              <div className="text-white">
                <div 
                  className="font-light leading-tight mb-2"
                  style={{ fontSize: "clamp(14px, 2.5vw, 18px)" }}
                >
                  "{quote.text}"
                </div>
                <div 
                  className="text-white/60 text-sm"
                  style={{ fontSize: "clamp(12px, 2vw, 14px)" }}
                >
                  {quote.source}, {quote.year}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Section 4组件
function Section4Content() {
  return (
    <div className="flex h-screen w-full px-8 md:px-16 lg:px-24 gap-10 md:gap-16 lg:gap-24">
      {/* 左侧标题区域 */}
      <div className="w-1/2 flex flex-col justify-center">
        <div className="text-white/60 text-sm mb-4">
          Chapter II: Shaping Tomorrow
        </div>
        <h1 
          className="text-white font-light leading-tight"
          style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
        >
          No one truly knows what the future of AI holds—but with foresight, we can be ready for whatever comes next.
        </h1>
      </div>

      {/* 右侧滚动区域 */}
      <div className="w-1/2 flex items-center h-full">
        <div className="w-full h-96">
          <QuotesCarousel />
        </div>
      </div>
    </div>
  );
}

const Section4 = forwardRef(function Section4(props, ref) {
  return (
    <section 
      ref={ref}
      className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center text-white pointer-events-none"
      style={{ 
        opacity: 0, 
        zIndex: 10
      }}
    >
      <div className="w-full pointer-events-auto">
        <Section4Content />
      </div>
    </section>
  );
});

export default Section4;
