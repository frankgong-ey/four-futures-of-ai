"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

// ChartSection组件 - 100vh高度，包含图表和趋势线动画
export default function ChartSection() {
  // 内部创建 refs
  const sectionRef = useRef(null);
  const aiChartRef = useRef(null);
  const trendLineRef = useRef(null);
  const backgroundPathRef = useRef(null);
  
  // ChartSection 动画初始化 - 整合所有 ScrollTrigger 动画
  useEffect(() => {
    if (sectionRef.current) {
      // 设置 ChartSection 初始状态
      gsap.set(sectionRef.current, { opacity: 0 });
      
      // 1. ChartSection 淡入淡出动画
      const sectionEntranceTween = gsap.to(sectionRef.current, {
        opacity: 1,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 50%",
          end: "bottom 50%",
          markers: true,
          toggleActions: "play reverse play reverse",
        }
      });

      // 2. 趋势线动画（如果 ref 存在）
      let chartTween = null;
      if (trendLineRef.current && backgroundPathRef.current) {
        chartTween = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          }
        });
        
        // 趋势线动画序列
        chartTween.to(".data-point", {
          opacity: 1,
          duration: 0.1,
          stagger: 0.1,
          ease: "none"
        })
        .to(".data-label", {
          opacity: 1,
          y: 0,
          duration: 0.1,
          stagger: 0.1,
          ease: "power2.out"
        }, "-=0.4")
        .to([trendLineRef.current, backgroundPathRef.current], {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power2.out",
        });
      }

      // 清理函数
      return () => {
        sectionEntranceTween.kill();
        if (chartTween) {
          chartTween.kill();
        }
      };
    }
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative w-full h-screen bg-transparent"
    >
      <div className="pt-[240px] px-[16px] md:px-[64px] sm:px-[16px] z-10">
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
                r="4" 
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
      </svg>
    </div>
  );
}
