"use client";

import React, { useState, useEffect } from 'react';

// Booth页面的章节配置
const BOOTH_SECTIONS = [
  { name: 'Hero', top: 0, label: '01' },
  { name: 'Gallery', top: 102, label: '02' },
  { name: 'Chart', top: 400, label: '03' },
  { name: 'Quote', top: 500, label: '04' },
  { name: 'Question', top: 600, label: '05' },
  { name: 'Ending', top: 1100, label: '06' },
  { name: 'Video', top: 1200, label: '07' },
];

export default function ScrollProgress() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0); // 0-1 当前section内的进度

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const scrollVh = (scrollY / viewportHeight) * 100;

      // 找到当前所在的section
      let foundIndex = 0;
      for (let i = BOOTH_SECTIONS.length - 1; i >= 0; i--) {
        if (scrollVh >= BOOTH_SECTIONS[i].top - 2) {
          foundIndex = i;
          break;
        }
      }
      
      setCurrentSectionIndex(foundIndex);

      // 计算当前section内的滚动进度
      const currentSection = BOOTH_SECTIONS[foundIndex];
      const nextSection = BOOTH_SECTIONS[foundIndex + 1];
      
      if (nextSection) {
        const sectionStart = currentSection.top;
        const sectionEnd = nextSection.top;
        const sectionHeight = sectionEnd - sectionStart;
        const progressInSection = (scrollVh - sectionStart) / sectionHeight;
        setScrollProgress(Math.max(0, Math.min(1, progressInSection)));
      } else {
        // 最后一个section
        setScrollProgress(1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const currentSection = BOOTH_SECTIONS[currentSectionIndex];

  return (
    <div className="fixed right-[4px] bottom-6 flex items-end gap-3 z-[1000]">
        {/* 章节序号 */}
        <div className="text-white/60 text-sm font-semibold tracking-wider">
            {currentSection.label}
        </div>
        {/* 进度条 */}
        <div className="flex flex-col items-center gap-1">
            {BOOTH_SECTIONS.map((section, index) => {
            const isActive = index === currentSectionIndex;
            const isPassed = index < currentSectionIndex;
            
            return (
                <div
                key={section.label}
                className="relative"
                style={{ height: '12px' }}
                >
                {/* 进度条背景 */}
                <div 
                    className="w-[1px] h-full bg-white/20"
                />
                
                {/* 进度条填充 */}
                {(isPassed || isActive) && (
                    <div 
                    className="absolute top-0 left-0 w-[1px] bg-white transition-all duration-300"
                    style={{ 
                        height: isPassed ? '100%' : `${scrollProgress * 100}%`
                    }}
                    />
                )}
                </div>
            );
            })}
        </div>


    </div>
  );
}

