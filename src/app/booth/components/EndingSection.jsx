"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

// ChartSection组件 - 100vh高度，包含图表和趋势线动画
export default function EndingSection() {
  // 内部创建 refs
  const sectionRef = useRef(null);
  
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

      // 清理函数
      return () => {
        sectionEntranceTween.kill();
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
          {/* 标题 1-8 列 */}
          <div className="col-span-8 col-start-1 flex flex-col gap-[16px] items-start">
            <h2 className="text-4xl md:text-[80px] sm:text-3xl leading-none text-white">
              "In dealing with the future, it's more important to be <span className='underline'>imaginative</span> than to be right."
            </h2>
          </div>
          {/* 标题 4-8 列 */}
          <div className="col-span-4 col-start-4 flex flex-col gap-[8px] items-start">
            <div className="font-light text-[24px] text-white/80">Alvin Toffler</div>
            <div className="font-light text-[16px] text-white/80">Author of <span className="italic font-medium">Future Shock</span> and <span className="italic font-medium">The Third Wave</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}