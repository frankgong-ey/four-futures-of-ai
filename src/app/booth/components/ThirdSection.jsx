"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 注册 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger);

// Chart组件 - 100vh高度，红色背景
function Chart({ chartRef, aiChartRef, trendLineRef, backgroundPathRef }) {
  return (
    <div 
      ref={chartRef}
      className="relative w-full h-screen bg-transparent"
    >
        <div className="sticky top-[240px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-10">
          <div className="grid grid-cols-12 gap-[24px]">
            {/* AIChart 占据左侧 1-6 列 */}
            <div className="col-span-8 col-start-1 mt-15">
              <AIChart aiChartRef={aiChartRef} trendLineRef={trendLineRef} backgroundPathRef={backgroundPathRef} />
            </div>
            {/* 标题占据右侧 9-12 列 */}
            <div className="col-span-4 col-start-9 flex flex-col gap-[16px] items-start">
              <div className="font-light text-white/80">AI's Accuracy on Humanity's Last Exam</div>
              <h2 className="text-4xl md:text-[80px] sm:text-3xl leading-none text-white">
                  AI performance has improved exponentially.
              </h2>
            </div>
          </div>
        </div>
        

    </div>
  );
}

// AI模型准确率散点图组件
function AIChart({ aiChartRef, trendLineRef, backgroundPathRef }) {
  return (
    <div 
      ref={aiChartRef}
      className="w-full h-[500px]"
      style={{ 
        opacity: 1
      }}
    >
      <svg
        viewBox="0 0 800 400"
        style={{ width: '100%', height: '500px' }}
      >
        {/* 渐变定义和滤镜 */}
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1D7FD2" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#1D7FD2" stopOpacity="0.4" />
            <stop offset="95%" stopColor="#1D7FD2" stopOpacity="0.0" />
          </linearGradient>
          
          {/* 趋势线渐变 - 右侧淡出 */}
          <linearGradient id="trendLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#87CEEB" stopOpacity="1" />
            <stop offset="70%" stopColor="#87CEEB" stopOpacity="1" />
            <stop offset="100%" stopColor="#87CEEB" stopOpacity="0" />
          </linearGradient>
          
          {/* 模糊滤镜 */}
          <filter id="blurFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12"/>
          </filter>
        </defs>

        {/* 背景路径 - 先渲染，在后面，带模糊效果 */}
        <path
          ref={backgroundPathRef}
          d="M 80 300 Q 600 280 750 120"
          stroke="url(#pathGradient)"
          strokeWidth="40"
          fill="none"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          filter="url(#blurFilter)"
        />
        
        {/* 网格线 */}
        {/* 水平网格线 */}
        {[0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20].map((value, index) => {
          const y = 350 - (value / 20) * 300;
          return (
            <line
              key={`h-${index}`}
              x1="80"
              y1={y}
              x2="750"
              y2={y}
              stroke="white"
              strokeWidth="0.5"
              opacity="0.2"
            />
          );
        })}

        {/* Y轴 */}
        <line x1="80" y1="50" x2="80" y2="350" stroke="white" strokeWidth="1" />
        
        {/* X轴 */}
        <line x1="80" y1="350" x2="750" y2="350" stroke="white" strokeWidth="1" />
        
        {/* Y轴标签 */}
        <text x="20" y="200" fill="white" fontSize="14" transform="rotate(-90, 20, 200)">
          Accuracy (%)
        </text>
        
        {/* Y轴刻度值 */}
        {[0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20].map((value, index) => {
          const y = 350 - (value / 20) * 300;
          return (
            <text key={`y-${index}`} x="70" y={y + 5} fill="white" fontSize="12" textAnchor="end">
              {value}
            </text>
          );
        })}
        
        {/* X轴刻度值 */}
        {['May, 24', 'Jul, 24', 'Sep, 24', 'Nov, 24', 'Jan, 25', 'Mar, 25', 'May, 25'].map((label, index) => {
          const x = 80 + (index / 6) * 670;
          return (
            <text key={`x-${index}`} x={x} y="370" fill="white" fontSize="12" textAnchor="middle">
              {label}
            </text>
          );
        })}
        


        {/* 趋势线 - 后渲染，在前面，带渐变效果 */}
        <path
          ref={trendLineRef}
          d="M 100 300 Q 600 280 750 120"
          stroke="url(#trendLineGradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="1000"
          strokeDashoffset="1000"
        />


        {/* 数据点 */}
        {[
          { name: 'GPT-4o', x: 0.2, y: 2.8 },
          { name: 'Claude 3.5 Sonnet', x: 1, y: 4.2 },
          { name: 'OpenAI o1', x: 3.5, y: 8.2 },
          { name: 'GPT-4.5 Preview', x: 5, y: 5.0 },
          { name: 'DeepSeek-R1', x: 4.5, y: 8.8 },
          { name: 'OpenAI o3-mini', x: 4.8, y: 13.5 },
          { name: 'Claude 3.7 Sonnet (16K)', x: 4.9, y: 7.8 },
          { name: 'GPT-4.1', x: 5.8, y: 5.5 },
          { name: 'Gemini 2.5 Flash', x: 5.85, y: 12.0 },
          { name: 'Gemini 2.5 Pro', x: 5.7, y: 19.0 },
          { name: 'o4-mini', x: 5.9, y: 18.0 },
          { name: 'OpenAI o3', x: 6, y: 20.5 }
        ].map((point, index) => {
          const x = 80 + (point.x / 6) * 670;
          const y = 350 - (point.y / 20) * 300;
          return (
            <g key={index}>
              <circle 
                cx={x} 
                cy={y} 
                r="0" 
                fill="white" 
                className="data-point"
                style={{ 
                  opacity: 0
                }}
              />
              <text 
                x={x - 16} 
                y={y - 12} 
                fill="white" 
                fontSize="10"
                className="data-label"
                style={{ 
                  opacity: 0, 
                  transform: `translateY(10px)`,
                  transformOrigin: `${x + 8}px ${y - 8}px`
                }}
              >
                {point.name}
              </text>
            </g>
          );
        })}
        

        

      </svg>
      
    </div>
  );
}

// 背景路径组件 - 与 AIChart 完全重叠的宽路径
function BackgroundPath() {
  return (
    <div 
      className="sticky left-16 z-[9998] w-[1000px] h-[500px]"
      style={{ 
        bottom: '160px',
        opacity: 1,
        position: 'relative'
      }}
    >
      <svg
        viewBox="0 0 800 400"
        style={{ 
          width: '100%', 
          height: '100%'
        }}
      >
        <path
          d="M 100 300 Q 600 280 750 120"
          stroke="#87CEEB"
          strokeWidth="20"
          fill="none"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

// Quotes组件 - 100vh高度，绿色背景
function Quotes({ quotesRef, shouldPlayAnimation, shouldPlayTitleAnimation }) {
  const animationRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    // 创建循环动画
    const createAnimationCycle = () => {
      const tl = gsap.timeline();
      
      // 调试信息
      const rightElements = animationRef.current.querySelectorAll(".cross-right");
      const leftElements = animationRef.current.querySelectorAll(".cross-left");
      const downElements = animationRef.current.querySelectorAll(".cross-down");
      const upElements = animationRef.current.querySelectorAll(".cross-up");
      console.log("Found cross elements:", rightElements.length, leftElements.length, downElements.length, upElements.length);
      
      // 阶段1: 十字星出现 (0.5秒) - 从中心点向四个方向同时延伸
      console.log("Animating cross elements...");
      console.log("Right elements:", rightElements);
      console.log("Left elements:", leftElements);
      console.log("Down elements:", downElements);
      console.log("Up elements:", upElements);
      
      // 阶段1: 十字星出现 (0.5秒) - 从中心点向四个方向同时延伸
      if (rightElements.length > 0) {
        console.log("Starting cross animation...");
        // 先设置初始状态
        gsap.set([rightElements, leftElements, downElements, upElements], {
          opacity: 0,
          strokeDashoffset: 12
        });
        
        tl.to([rightElements, leftElements, downElements, upElements], {
          opacity: 1,
          strokeDashoffset: 0,
          duration: 0.5,
          ease: "power2.out",
          onStart: () => console.log("Cross animation started"),
          onComplete: () => console.log("Cross animation complete")
        })
      } else {
        console.log("No cross elements found, skipping animation");
      }

      // 阶段2: Quote cards 从十字星位置向右下扩展 (1秒) - 在十字星动画完成后开始
      tl.to(animationRef.current.querySelectorAll(".quote-card-container"), {
        opacity: 1,
        width: "360px", // 从1px放大到320px
        height: "200px", // 从1px放大到128px
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1
      }, "+=0.5") // 十字星动画完成后0.5秒开始
      .to(animationRef.current.querySelectorAll(".quote-content"), {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.1
      }, "+=0.1") // 容器放大完成后0.1秒开始

      // 阶段3: 保持显示状态 - 动画结束，不再有淡出效果

      return tl;
    };

    // 立即设置初始隐藏状态，不等待 ScrollTrigger
    if (animationRef.current) {
      console.log("Setting initial hidden state...");
      
      // 设置所有元素的初始隐藏状态
      gsap.set(animationRef.current.querySelectorAll(".cross-right, .cross-left, .cross-down, .cross-up"), {
        opacity: 0,
        strokeDashoffset: 12
      });
      
      // 设置 quote cards 的初始隐藏状态
      gsap.set(animationRef.current.querySelectorAll(".quote-card-container"), {
        opacity: 0,
        width: "1px",
        height: "1px"
      });
    }

    // 设置标题的初始隐藏状态
    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0 });
    }

    // 创建动画但不自动播放，等待外部触发
    const timer = setTimeout(() => {
      if (animationRef.current) {
        console.log("Creating quotes animation...");
        
        const animation = createAnimationCycle();
        animation.pause(); // 创建后立即暂停，等待外部触发
        
        // 存储动画引用以便外部触发
        animationRef.current._animation = animation;
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (animationRef.current && animationRef.current._animation) {
        animationRef.current._animation.kill();
      }
    };
  }, []);

  // 监听外部动画触发
  useEffect(() => {
    if (shouldPlayAnimation && animationRef.current && animationRef.current._animation) {
      console.log("Playing quotes animation from external trigger");
      animationRef.current._animation.play();
    }
  }, [shouldPlayAnimation]);

  // 监听标题动画触发
  useEffect(() => {
    if (shouldPlayTitleAnimation && titleRef.current) {
      console.log("Playing title animation from external trigger");
      gsap.to(titleRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        onStart: () => console.log("Title fade in started"),
        onComplete: () => console.log("Title fade in complete")
      });
    }
  }, [shouldPlayTitleAnimation]);

  // Quote cards 数据
  // Quote cards 数据
  const quoteCards = [
    {
      id: 1,
      text: `"The looming AI monopolies"`,
      logo: "/images/Politico.svg",
      source: "Politico, 2024",
      position: { top: "20%", left: "5%" }, // 更左一点
      crossPosition: { top: "15%", left: "10%" }, // 十字星也相应左移
      direction: "bottom-left"
    },
    {
      id: 2,
      text: `"ChatGPT May Be Eroding Critical Thinking Skills, According to a New MIT Study"`,
      logo: "/images/Time.svg",
      source: "Time, 2025",
      position: { top: "25%", left: "75%" }, // 右上角
      crossPosition: { top: "20%", left: "70%" },
      direction: "bottom-right"
    },
    {
      id: 3,
      text: `"How will you respond when AI agents reshape your firm's business model?"`,
      logo: "/images/AccountingToday.svg",
      source: "Accounting Today, 2025",
      position: { top: "70%", left: "10%" }, // 左下角
      crossPosition: { top: "65%", left: "15%" },
      direction: "top-left"
    },
    {
      id: 4,
      text: `"OpenAI's Sam Altman predicts artificial superintelligence (AGI) by 2025"`,
      logo: "/images/TechRadar.svg",
      source: "Tech Radar, 2024",
      position: { top: "70%", left: "40%" }, // 中下角
      crossPosition: { top: "65%", left: "45%" },
      direction: "top-right"
    },
    {
      id: 5,
      text: `"OpenAI's $10 Million+ AI Consulting Business: Deployment Takes Center Stage"`,
      logo: "/images/Forbes.svg",
      source: "Forbes, 2025",
      position: { top: "60%", left: "80%" }, // 右下角
      crossPosition: { top: "55%", left: "75%" },
      direction: "top-left"
    }
  ];

  return (
    <div 
      ref={quotesRef}
      className="w-full h-screen bg-transparent relative px-[16px] md:px-[64px] sm:px-[16px]"
    >
      {/* 中央标题 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <h2 ref={titleRef} className="text-4xl md:text-[80px] sm:text-3xl leading-none text-white">
          No one truly knows what the future of AI holds.
        </h2>
      </div>

      {/* 动画容器 */}
      <div ref={animationRef} className="absolute inset-0">
        {/* 5个十字和Quote Cards */}
        {quoteCards.map((card) => (
            <div key={card.id} className="absolute w-full h-full">
                {/* 白色十字 */}
                <div 
                    className="absolute w-16 h-16 pointer-events-none"
                    style={{
                    ...card.crossPosition,
                    transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* SVG 十字星 - 分解为四个线段 */}
                        <svg 
                            width="32" 
                            height="32" 
                            viewBox="0 0 32 32" 
                            className="cross-svg"
                            style={{ zIndex: 30 }}
                        >
                            {/* 右半段水平线 - 从中心向右延伸 */}
                            <line 
                            x1="16" 
                            y1="16" 
                            x2="28" 
                            y2="16" 
                            stroke="white" 
                            strokeWidth="1" 
                            className="cross-right"
                            />
                            {/* 左半段水平线 - 从中心向左延伸 */}
                            <line 
                            x1="16" 
                            y1="16" 
                            x2="4" 
                            y2="16" 
                            stroke="white" 
                            strokeWidth="1" 
                            className="cross-left"
                            />
                            {/* 下半段垂直线 - 从中心向下延伸 */}
                            <line 
                            x1="16" 
                            y1="16" 
                            x2="16" 
                            y2="28" 
                            stroke="white" 
                            strokeWidth="1" 
                            className="cross-down"
                            />
                            {/* 上半段垂直线 - 从中心向上延伸 */}
                            <line 
                            x1="16" 
                            y1="16" 
                            x2="16" 
                            y2="4" 
                            stroke="white" 
                            strokeWidth="1" 
                            className="cross-up"
                            />
                        </svg>
                    </div>
                </div>

                {/* Quote Card */}
                <div 
                    className="absolute w-1 h-1 overflow-hidden quote-card-container outline outline-1 outline-white/20"
                    style={{
                    ...card.crossPosition, // 使用十字星的位置作为起始点
                    zIndex: 10, // 设置较低的 z-index
                    // 不使用 transform: translate，让左上角直接定位在十字星位置
                    }}
                >
                    <div className="relative w-full h-full p-6 quote-card">
                        {/* Logo - 相对于最外层容器定位 */}
                        <img 
                            src={card.logo} 
                            alt="Logo" 
                            className="quote-logo absolute"
                            style={{ 
                                height: '24px',
                                bottom: '16px',
                                right: '16px'
                            }}
                        />
                    
                        {/* 内容 - 初始隐藏 */}
                        <div className="relative z-10 text-white quote-content" style={{ opacity: 0 }}>
                            <p className="text-[20px] leading-relaxed mb-3 quote-text">
                                {card.text}
                            </p>
                            <div className="relative">
                                <span className="text-xs text-white/70 quote-source">
                                    {card.source}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <style jsx>{`
        .cross-svg {
          opacity: 1;
        }
        .cross-right {
          opacity: 0;
          stroke-dasharray: 12;
          stroke-dashoffset: 12;
        }
        .cross-left {
          opacity: 0;
          stroke-dasharray: 12;
          stroke-dashoffset: 12;
        }
        .cross-down {
          opacity: 0;
          stroke-dasharray: 12;
          stroke-dashoffset: 12;
        }
        .cross-up {
          opacity: 0;
          stroke-dasharray: 12;
          stroke-dashoffset: 12;
        }
        .quote-card-container {
          opacity: 0;
          width: 1px;
          height: 1px;
        }
        .quote-card {
          opacity: 1;
          transform: scale(1);
        }
        .quote-content {
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

// 主ThirdSection组件
export default function ThirdSection({ chartRef, quotesRef, sectionRef, aiChartRef, trendLineRef, backgroundPathRef, shouldPlayQuotesAnimation, shouldPlayTitleAnimation }) {
  return (
    <div 
      ref={sectionRef}
      className="relative w-full h-[200vh] bg-transparent"
    >
 
  
          {/* Chart部分 - 前100vh，包含 AIChart */}
          <Chart 
            chartRef={chartRef} 
            aiChartRef={aiChartRef} 
            trendLineRef={trendLineRef} 
            backgroundPathRef={backgroundPathRef} 
          />
        
          {/* Quotes部分 - 后100vh */}
          <Quotes quotesRef={quotesRef} shouldPlayAnimation={shouldPlayQuotesAnimation} shouldPlayTitleAnimation={shouldPlayTitleAnimation} />
    </div>
  );
}
