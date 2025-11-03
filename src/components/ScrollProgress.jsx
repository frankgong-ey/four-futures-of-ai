"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();
  const isFuturesPage = pathname?.startsWith('/futures');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0); // 0-1 当前section内的进度
  const [isHeroSection, setIsHeroSection] = useState(false);

  // 初始化时检查是否在HeroSection
  useEffect(() => {
    if (isFuturesPage) {
      const checkHeroSection = () => {
        const sections = document.querySelectorAll('[data-futures-section]');
        const heroSection = document.querySelector('[data-hero-section]');
        // 如果没有futures sections但有hero section，说明在HeroSection
        if (sections.length === 0 && heroSection) {
          setIsHeroSection(true);
        } else {
          setIsHeroSection(false);
        }
      };
      
      // 立即检查一次
      checkHeroSection();
      // 延迟检查，确保DOM已渲染
      const timer = setTimeout(checkHeroSection, 100);
      return () => clearTimeout(timer);
    }
  }, [isFuturesPage]);

  useEffect(() => {
    const handleScroll = () => {
      if (isFuturesPage) {
        // Futures页面的逻辑：基于section元素位置
        const sections = document.querySelectorAll('[data-futures-section]');
        if (sections.length === 0) {
          // 检查是否在HeroSection（没有data-futures-section元素）
          const heroSection = document.querySelector('[data-hero-section]');
          setIsHeroSection(!!heroSection);
          return;
        }
        
        // 有sections了，说明不在HeroSection
        setIsHeroSection(false);
        
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        let foundIndex = 0;
        
        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = rect.bottom + window.scrollY;
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            foundIndex = index;
          }
        });
        
        setCurrentSectionIndex(foundIndex);
        
        // 计算当前section内的滚动进度
        const currentSection = sections[foundIndex];
        const nextSection = sections[foundIndex + 1];
        
        if (currentSection && nextSection) {
          const currentRect = currentSection.getBoundingClientRect();
          const nextRect = nextSection.getBoundingClientRect();
          const sectionHeight = nextRect.top - currentRect.top;
          const scrollProgressInSection = -currentRect.top / sectionHeight;
          setScrollProgress(Math.max(0, Math.min(1, scrollProgressInSection)));
        } else {
          setScrollProgress(1);
        }
      } else {
        // Booth页面的逻辑
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
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isFuturesPage]);

  // Futures页面的sections信息
  const [futuresSections, setFuturesSections] = useState([]);
  
  useEffect(() => {
    if (isFuturesPage) {
      const updateSections = () => {
        const sections = document.querySelectorAll('[data-futures-section]');
        const labels = Array.from(sections).map((_, i) => String(i + 1).padStart(2, '0'));
        if (labels.length > 0) {
          setFuturesSections(labels);
        }
      };
      
      // 立即尝试一次
      updateSections();
      
      // 延迟再试一次，确保DOM已经渲染
      const timer = setTimeout(updateSections, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isFuturesPage]);

  const displaySections = isFuturesPage ? futuresSections : BOOTH_SECTIONS;
  
  // 对于futures页面，即使sections为空也显示，避免闪烁
  if (!isFuturesPage && displaySections.length === 0) return null;

  // 在futures页面的HeroSection时隐藏进度条
  if (isFuturesPage && isHeroSection) return null;

  // 如果futures页面sections为空，显示占位内容
  const effectiveSections = displaySections.length > 0 ? displaySections : ['01', '02', '03', '04'];
  
  // 使用effectiveSections来确定currentLabel
  const currentLabel = isFuturesPage 
    ? (effectiveSections[currentSectionIndex] || '01')
    : (displaySections[currentSectionIndex]?.label || '01');

  return (
    <div className="fixed right-[4px] bottom-6 flex items-end gap-3 z-[1000]">
        {/* 章节序号 */}
        <div className="text-white/60 text-sm font-semibold tracking-wider">
            {currentLabel}
        </div>
        {/* 进度条 */}
        <div className="flex flex-col items-center gap-1">
            {effectiveSections.map((section, index) => {
            const label = isFuturesPage 
              ? (typeof section === 'string' ? section : String(index + 1).padStart(2, '0'))
              : section.label;
            // 新逻辑：01显示1条，02显示2条，03显示3条...
            // index从0开始，currentSectionIndex从0开始
            // 当前在01时(currentSectionIndex=0)，显示1条(index <= 0)
            // 当前在02时(currentSectionIndex=1)，显示2条(index <= 1)
            // 所以逻辑是 index <= currentSectionIndex，但是要显示currentSectionIndex + 1条进度条
            const shouldShow = index <= currentSectionIndex;
            
            return (
                <div
                key={label}
                className="relative"
                style={{ height: '12px' }}
                >
                {/* 进度条背景 */}
                <div 
                    className="w-[1px] h-full bg-white/20"
                />
                
                {/* 进度条填充 */}
                {shouldShow && (
                    <div 
                    className="absolute top-0 left-0 w-[1px] bg-white transition-all duration-300"
                    style={{ 
                        height: '100%'
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

