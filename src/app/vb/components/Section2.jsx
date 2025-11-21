"use client";

import React, { useState, useEffect } from "react";

// Tile 组件 - 显示 ROI，独立管理更新和动画
const ROITile = ({ initialRoi, index, sectionId }) => {
  const [roi, setRoi] = useState(initialRoi);
  const [isAnimating, setIsAnimating] = useState(false);
  const [maskColor, setMaskColor] = useState(initialRoi > 0 ? "#8BDBDC" : "#EB5242");
  const animationKeyRef = React.useRef(0);
  
  const isPositive = roi > 0;
  const color = isPositive ? "#8BDBDC" : "#EB5242";
  const borderColor = isPositive ? "rgba(139, 219, 220, 0.5)" : "rgba(235, 82, 66, 0.5)"; // 50% 透明度
  const sign = isPositive ? "+" : "";

  useEffect(() => {
    // 每个 tile 有独立的随机更新间隔（8-15秒之间，更慢的频率）
    const updateInterval = 8000 + Math.random() * 7000;
    
    const interval = setInterval(() => {
      const newRoi = Math.floor(Math.random() * 101) - 50;
      const newColor = newRoi > 0 ? "#8BDBDC" : "#EB5242";
      
      // 先更新 mask 颜色（会有 500ms 渐变）
      setMaskColor(newColor);
      
      // 触发动画 - mask 从左侧进入
      setIsAnimating(true);
      animationKeyRef.current += 1;
      
      // mask 覆盖后更新值（在动画中间）
      setTimeout(() => {
        setRoi(newRoi);
      }, 1000); // mask 动画的一半时间（2秒的一半）
      
      // 动画结束后重置状态
      setTimeout(() => {
        setIsAnimating(false);
      }, 2000); // 动画总时长（更慢）
    }, updateInterval);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="border flex items-center justify-center relative overflow-hidden"
      style={{
        borderColor: borderColor, // 50% 透明度
        color: color,
        height: "28px",
        transition: 'border-color 0.5s ease-in-out, color 0.5s ease-in-out',
      }}
    >
      <span 
        key={animationKeyRef.current}
        className="text-xs font-medium inline-block relative z-10"
        style={{
          color: color,
        }}
      >
        {sign}{roi}% ROI
      </span>
      {/* Mask 动画 - 从左侧进入，从右侧离开 */}
      {isAnimating && (
        <div
          className="absolute inset-0 z-20"
          style={{
            backgroundColor: maskColor,
            animation: `maskSlide-${sectionId}-${index} 2s ease-in-out forwards`,
            transition: 'background-color 0.5s ease-in-out', // 500ms 颜色渐变
          }}
        />
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes maskSlide-${sectionId}-${index} {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `
      }} />
    </div>
  );
};

// 生成随机 ROI 值
const generateRandomROI = () => {
  // 生成 -50 到 +50 之间的随机数
  return Math.floor(Math.random() * 101) - 50;
};

// 生成 8 个 tile 的 ROI 数组
const generateTiles = () => {
  return Array.from({ length: 8 }, () => generateRandomROI());
};

export default function Section2() {
  // 使用 useState 和 useEffect 确保只在客户端生成随机值，避免 hydration 错误
  const [initialMarketingTiles, setInitialMarketingTiles] = useState([]);
  const [initialFinanceTiles, setInitialFinanceTiles] = useState([]);
  const [initialRdTiles, setInitialRdTiles] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 只在客户端生成随机值
    setInitialMarketingTiles(Array.from({ length: 8 }, () => generateRandomROI()));
    setInitialFinanceTiles(Array.from({ length: 8 }, () => generateRandomROI()));
    setInitialRdTiles(Array.from({ length: 8 }, () => generateRandomROI()));
  }, []);

  const leftItems = [
    {
      icon: "/images/value-blueprints/use-case.svg",
      title: "Use-Case Driven",
      description: "Large portfolios of bottoms-up opportunities focused on productivity gains and cost reduction",
      isYellow: false
    },
    {
      icon: "/images/value-blueprints/bolt-on.svg",
      title: "Bolt-on AI",
      description: "AI added to \"as is\" processes anchored in fixed, legacy processes",
      isYellow: false
    },
    {
      icon: "/images/value-blueprints/disjointed.svg",
      title: "Disjointed Approach",
      description: "Functions experimenting and operating in silos resulting in data & tool overload",
      isYellow: false
    },
    {
      icon: "/images/value-blueprints/plateaued.svg",
      title: "THE RESULT",
      subtitle: "Plateaued Value",
      description: "The impact of use cases reaches a natural limit without further innovation.",
      isYellow: true
    }
  ];

  return (
    <section 
      className="relative w-full text-white py-16 pl-[5%] pr-[5%]"
      style={{ 
        fontFamily: 'var(--font-eyinterstate)', 
        // 不设置 z-index，让背景图片可以延伸到 Section2
      }}
    >
      {/* 背景层 - 覆盖整个 Section2，z-index 为 1，在背景图片下方 */}
      <div 
        className="absolute inset-0 bg-black z-[1]"
      />
      
      <div 
        className="max-w-[1440px] mx-auto relative z-10"
      >
        {/* 大标题和文字 */}
        <div className="mb-12">
          <h2 
            className="text-[36px] md:text-[64px] font-normal leading-tight mb-6 tracking-[-0.05em]"
            style={{
              background: 'linear-gradient(to right, white, #EAD726)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Today's AI Challenge
          </h2>
          <p className="font-normal text-[16px] md:text-[24px] mb-6 max-w-3xl">
            Drawing on our market experience from delivering thousands of AI use cases across industries, we have identified common patterns.
          </p>
        </div>

        {/* 两栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* 左侧：4个 div */}
          <div className="space-y-4 max-w-[640px]">
            {leftItems.map((item, index) => {
              // 第四个div（黄色框）有特殊布局
              if (item.isYellow) {
                return (
                  <div 
                    key={index}
                    className="p-4 bg-[#FFE600] rounded-none border border-black"
                  >
                    {/* THE RESULT 在左上角 */}
                    <div className="text-sm font-bold mb-3 text-black">
                      {item.title}
                    </div>
                    {/* 图标和 Plateaued Value 在同一行 */}
                    <div className="flex items-center gap-3 mb-2">
                      <img 
                        src={item.icon} 
                        alt={item.subtitle}
                        className="w-9 h-9 flex-shrink-0 brightness-0"
                      />
                      <h3 className="text-[18px] md:text-[20px] font-bold text-black">
                        {item.subtitle}
                      </h3>
                    </div>
                    {/* 描述文字 */}
                    <p className="font-normal text-[16px] md:text-[18px] leading-relaxed tracking-tight text-black">
                      {item.description}
                    </p>
                  </div>
                );
              }
              
              // 前三个div保持原有布局
              return (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 bg-white/5 rounded-none border border-white/10"
                >
                  <img 
                    src={item.icon} 
                    alt={item.title}
                    className="w-9 h-9 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-[18px] md:text-[20px] font-bold mb-2 text-white">
                      {item.title}
                    </h3>
                    <p className="text-[16px] md:text-[18px] leading-relaxed text-white">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 右侧：三个部分 */}
          <div className="space-y-8 max-w-[560px]">
            {/* Marketing Use Cases */}
            <div>
              <h3 className="text-[20px] font-normal mb-4 text-center">Marketing Use Cases</h3>
              <div className="grid grid-cols-4 gap-3">
                {mounted && initialMarketingTiles.length > 0 ? (
                  initialMarketingTiles.map((roi, index) => (
                    <ROITile 
                      key={`marketing-${index}`} 
                      initialRoi={roi} 
                      index={index} 
                      sectionId="marketing"
                    />
                  ))
                ) : (
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={`marketing-placeholder-${index}`} className="border border-white/10 h-[28px]" />
                  ))
                )}
              </div>
            </div>

            {/* Finance Use Cases */}
            <div>
              <h3 className="text-[20px] font-normal mb-4 text-center">Finance Use Cases</h3>
              <div className="grid grid-cols-4 gap-3">
                {mounted && initialFinanceTiles.length > 0 ? (
                  initialFinanceTiles.map((roi, index) => (
                    <ROITile 
                      key={`finance-${index}`} 
                      initialRoi={roi} 
                      index={index} 
                      sectionId="finance"
                    />
                  ))
                ) : (
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={`finance-placeholder-${index}`} className="border border-white/10 h-[28px]" />
                  ))
                )}
              </div>
            </div>

            {/* R&D Use Cases */}
            <div>
              <h3 className="text-[20px] font-normal mb-4 text-center">R&D Use Cases</h3>
              <div className="grid grid-cols-4 gap-3">
                {mounted && initialRdTiles.length > 0 ? (
                  initialRdTiles.map((roi, index) => (
                    <ROITile 
                      key={`rd-${index}`} 
                      initialRoi={roi} 
                      index={index} 
                      sectionId="rd"
                    />
                  ))
                ) : (
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={`rd-placeholder-${index}`} className="border border-white/10 h-[28px]" />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
