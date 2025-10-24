"use client";

import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// 注册 GSAP 插件
gsap.registerPlugin(ScrollToPlugin);

// 默认配置（通用页面）
const DEFAULT_SECTION_POSITIONS = [
  { name: 'section1', top: 0, duration: 1.5, ease: "power2.inOut" },
  { name: 'section2', top: 100, duration: 1.5, ease: "power2.inOut" },
];

export default function NextButton({ sections = DEFAULT_SECTION_POSITIONS }) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // 监听滚动位置，确定当前在哪个section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const scrollVh = (scrollY / viewportHeight) * 100;

      // 找到当前所在的section（使用更宽容的阈值）
      let foundIndex = 0;
      for (let i = sections.length - 1; i >= 0; i--) {
        // 使用 -2vh 的容差，避免精度问题
        if (scrollVh >= sections[i].top - 2) {
          foundIndex = i;
          break;
        }
      }
      
      console.log('NextButton: scrollY:', scrollY, 'vh:', viewportHeight, 'scrollVh:', scrollVh.toFixed(2), 'section:', sections[foundIndex].name, 'index:', foundIndex);
      setCurrentSectionIndex(foundIndex);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll); // 监听窗口大小变化
    handleScroll(); // 初始检查
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [sections]);

  // 点击处理：滚动到下一个section
  const handleClick = () => {
    console.log('NextButton clicked! Current index:', currentSectionIndex);
    const nextIndex = currentSectionIndex + 1;
    console.log('Next index:', nextIndex, 'Total sections:', sections.length);
    
    if (nextIndex < sections.length) {
      const currentSection = sections[currentSectionIndex];
      const nextSection = sections[nextIndex];
      const viewportHeight = window.innerHeight;
      const targetScrollY = (nextSection.top / 100) * viewportHeight;
      
      // 使用当前section的duration和ease设置滚动速度和缓动
      const scrollDuration = currentSection.duration;
      const scrollEase = currentSection.ease;
      
      console.log('Scrolling from:', currentSection.name, 'to:', nextSection.name, 'at', nextSection.top + 'vh', '(', targetScrollY, 'px)', 'duration:', scrollDuration + 's', 'ease:', scrollEase);

      // 使用 GSAP 平滑滚动，使用自定义速度和缓动
      gsap.to(window, {
        scrollTo: { y: targetScrollY, autoKill: false },
        duration: scrollDuration,
        ease: scrollEase
      });
    } else {
      console.log('Already at last section, not scrolling');
    }
  };

  // 如果已经是最后一个section，隐藏按钮
  if (currentSectionIndex >= sections.length - 1) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="group fixed right-16 bottom-6 w-[80px] h-[160px] 
                 border border-white/20 bg-transparent 
                 flex flex-col items-center justify-between 
                 py-6 px-[16px] z-[1000] 
                 transition-all duration-500 ease-out
                 hover:border-white/50 
                 active:border-white/80 
                 cursor-pointer"
    >
      {/* Next 文本 */}
      <div className="text-white text-[18px] font-semibold text-center tracking-none">
        Next
      </div>

      {/* 向下箭头图标（SVG） */}
      <img
        src="/images/arrow-next.svg"
        alt="Next"
        className="w-8 h-8 mt-2 transition-transform duration-500 ease-out group-hover:translate-y-2"
      />

      {/* 底部分隔线 */}
      <div className="absolute bottom-0 w-full h-[1px] group-hover:h-[4px] bg-white transition-all duration-500 ease-out" />
    </button>
  );
}
