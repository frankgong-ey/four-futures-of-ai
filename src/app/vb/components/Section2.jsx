"use client";

import React, { useState, useEffect } from "react";

// Tile 组件 - 显示 ROI，独立管理更新和动画
const ROITile = ({ initialRoi, index, sectionId }) => {
  const [roi, setRoi] = useState(initialRoi);
  const [isAnimating, setIsAnimating] = useState(false);
  const [maskColor, setMaskColor] = useState(initialRoi > 0 ? "#8BDBDC" : "#EB5242");
  const animationKeyRef = React.useRef(0);
  
  const isPositive = roi > 0;
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
      className="border flex items-center justify-center relative overflow-hidden px-4"
      style={{
        borderColor: borderColor, // 50% 透明度
        height: "64px",
        minWidth: "96px",
        transition: 'border-color 0.5s ease-in-out, color 0.5s ease-in-out',
      }}
    >
      <span 
        key={animationKeyRef.current}
        className="text-[16px] font-bold inline-block relative z-10 text-white text-center"
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

export default function Section2() {
  // 使用 useState 和 useEffect 确保只在客户端生成随机值，避免 hydration 错误
  const [initialMarketingTiles, setInitialMarketingTiles] = useState([]);
  const [initialFinanceTiles, setInitialFinanceTiles] = useState([]);
  const [initialRdTiles, setInitialRdTiles] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 只在客户端生成随机值
    setInitialMarketingTiles(Array.from({ length: 9 }, () => generateRandomROI()));
    setInitialFinanceTiles(Array.from({ length: 9 }, () => generateRandomROI()));
    setInitialRdTiles(Array.from({ length: 9 }, () => generateRandomROI()));
  }, []);

  return (
    <section 
      className="relative w-full text-white min-h-screen py-20 pl-[5%] pr-[5%] flex items-center"
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
        className="max-w-[1440px] mx-auto relative z-10 w-full"
      >
        {/* 顶部标题区域 */}
        <div className="max-w-4xl mx-auto text-center mb-16 flex flex-col items-center gap-4">
          <p className="text-[28px] md:text-[48px] font-normal tracking-[-0.05em] leading-none">
            AI is changing the world.
          </p>
          <h2 
            className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-[#FFE601]"
          >
            Why isn’t it driving more value?
          </h2>
          <div 
            className="w-40 h-[3px] mx-auto"
            style={{
              background: 'linear-gradient(to right, #FFDD0B, #FF789B, #34F8FD)',
            }}
          />
        </div>

        {/* 文案与 ROI 矩阵 */}
        <div className="flex flex-col items-center">
          {/* AI Use Cases 标题 */}
          <div className="mb-4 text-center">
            <p className="text-[24px] md:text-[32px] font-bold uppercase tracking-[-0.05em]">
              AI Use Cases
            </p>
          </div>

          {/* 三列 ROI 区块 */}
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Marketing */}
            <div className="flex flex-col items-center">
              <h3 className="text-[18px] md:text-[24px] font-bold uppercase tracking-[-0.05em] mb-6">
                Marketing
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {mounted && initialMarketingTiles.length > 0 ? (
                  initialMarketingTiles.map((roi, index) => (
                    <ROITile 
                      key={`marketing-${index}`} 
                      initialRoi={roi} 
                      index={index} 
                      sectionId="marketing"
                    />
                  ))
                ) : null}
              </div>
            </div>

            {/* Finance */}
            <div className="flex flex-col items-center">
              <h3 className="text-[18px] md:text-[24px] font-bold uppercase tracking-[-0.05em] mb-6">
                Finance
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {mounted && initialFinanceTiles.length > 0 ? (
                  initialFinanceTiles.map((roi, index) => (
                    <ROITile 
                      key={`finance-${index}`} 
                      initialRoi={roi} 
                      index={index} 
                      sectionId="finance"
                    />
                  ))
                ) : null}
              </div>
            </div>

            {/* R&D */}
            <div className="flex flex-col items-center">
              <h3 className="text-[18px] md:text-[24px] font-bold uppercase tracking-[-0.05em] mb-6">
                R&D
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {mounted && initialRdTiles.length > 0 ? (
                  initialRdTiles.map((roi, index) => (
                    <ROITile 
                      key={`rd-${index}`} 
                      initialRoi={roi} 
                      index={index} 
                      sectionId="rd"
                    />
                  ))
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
