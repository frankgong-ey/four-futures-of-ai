"use client";

import React from "react";

// Prompt卡片组件
function PromptCard({ text, isActive, progress }) {
  return (
    <div className={`relative w-[100%] p-[8px] bg-black/10 backdrop-blur-xl border border-white/40 will-change-[transform,opacity] transition-transform transition-opacity duration-500 ease-in-out ${
      isActive 
        ? 'opacity-100 transform translate-y-0 scale-105 bg-black bg-opacity-50 shadow-2xl' 
        : 'opacity-30 transform translate-y-5 scale-90'
    }`}>
      <p className="text-white text-[16px] font-medium mb-2.5">Prompt</p>
      <p className="text-white/80 text-sm leading-relaxed">{text}</p>
      <div className="mt-1 text-[11px] text-white/60">{(progress * 100).toFixed(16)}%</div>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden`}>
        <div 
          className="h-full bg-white rounded-sm will-change-[width" 
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>
    </div>
  );
}

// 主GalleryScreen组件
export default function GalleryScreen({ scrollProgress = 0 }) {
  const sectionRef = React.useRef(null);

  const promptCards = [
    "Ethereal forest with glowing lights",
    "Cyberpunk street scene at night",
    "A serene mountain landscape",
    "Abstract digital art with vibrant colors",
    "A futuristic cityscape at sunset",
  ];

  return (
    <div ref={sectionRef} className="relative w-screen h-screen bg-transparent z-20">
        {/* HTML内容 */}
                {/* 底部标题 - 绝对定位，距离屏幕下边缘120px */}
        <div className="absolute bottom-[120px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-50">
            <div className="grid grid-cols-12 gap-[24px]">
            <div className="col-span-4 col-start-1 text-left flex flex-col gap-[16px] items-start">
                <h2 
                    className="text-4xl md:text-[80px] sm:text-3xl leading-none text-white"
                >
                    The rapid growth of AI 
                </h2>
                <div className="font-light text-white/80">In recent years, we have seen major improvements in AI across image and video creation capabilities</div>
            </div>
            </div>
        </div>
      <div className="relative h-[400vh] flex justify-center items-start">
        {/* 中间隔离带 */}
        <div className="w-60 h-screen flex flex-col justify-center items-center bg-black/0 sticky top-0">
          {/* Prompt卡片轮播 */}
          <div className="relative w-full h-screen flex flex-col justify-center items-center space-y-8">
            {promptCards.map((text, index) => {
              // 直接使用传入的 GalleryScrollProgress（0-1 区间）
              const p = scrollProgress;

              // 定义每张卡片的高亮区间 [start, end)
              const ranges = [
                [0.06, 0.22], // 第一张
                [0.23, 0.39], // 第二张
                [0.40, 0.55], // 第三张
                [0.56, 0.72], // 第四张
                [0.73, 0.88], // 第五张
              ];

              const [start, end] = ranges[index] || [1, 1];
              const isActive = p >= start && p < end;

              // 进度条：
              // p <= start  => 0
              // start < p < end => (p-start)/(end-start)
              // p >= end => 1（保持满格，直到用户回滚到区间内或之前）
              let progress = 0;
              if (p <= start) {
                progress = 0;
              } else if (p >= end) {
                progress = 1;
              } else {
                progress = (p - start) / (end - start);
              }

              return (
                <PromptCard
                  key={index}
                  text={text}
                  isActive={isActive}
                  progress={progress}
                />
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
