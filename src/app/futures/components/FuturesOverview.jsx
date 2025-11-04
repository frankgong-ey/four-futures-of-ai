"use client";

import React, { useState, useEffect, useRef } from "react";
import FutureSection from "./FutureSection";
import NextChapterSection from "./NextChapterSection";
import { useScrollSection } from "./Futures3DCanvas";

export default function FuturesOverview({ futures, onFutureClick }) {
  const [currentSection, setCurrentSection] = useState(0);
  const sectionsRef = useRef([]);
  const { setCurrentSection: setGlobalSection } = useScrollSection();

  const sections = [
    ...futures.map((future, index) => ({ 
      type: "future", 
      id: future.id, 
      data: future,
      index: index + 1
    })),
    { type: "next-chapter", id: "next-chapter" }
  ];

  // Helper to scroll to the next section
  const scrollToNextSection = (currentIndex) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < sections.length && sectionsRef.current[nextIndex]) {
      sectionsRef.current[nextIndex].scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle URL hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const targetIndex = sections.findIndex(s => s.id === hash);
        if (targetIndex !== -1 && sectionsRef.current[targetIndex]) {
          setTimeout(() => {
            // Use instant jump instead of smooth behavior
            sectionsRef.current[targetIndex].scrollIntoView({ behavior: 'auto' });
            window.history.replaceState(null, '', '/futures');
          }, 100);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen to scroll and update the current section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      sections.forEach((section, index) => {
        const element = sectionsRef.current[index];
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          const elementTop = top + window.scrollY;
          const elementBottom = bottom + window.scrollY;
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setCurrentSection(index);
            if (setGlobalSection) {
              // If it is next-chapter, pass "nextChapter"
              if (section.type === "future") {
                setGlobalSection(section.data.id);
              } else if (section.type === "next-chapter") {
                setGlobalSection("nextChapter");
              } else {
                setGlobalSection(null);
              }
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    // 初始状态：根据当前滚动位置设置
    const initScrollPosition = window.scrollY + window.innerHeight / 2;
    handleScroll(); // 初始调用

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections, setGlobalSection]);

  return (
    <div className="relative">
      {/* Main content */}
      <div className="relative z-10">
        {sections.map((section, index) => (
          <div 
            key={section.id} 
            ref={(el) => (sectionsRef.current[index] = el)}
            data-futures-section
            className="min-h-screen flex items-center justify-start"
          >
            {section.type === "future" && (
              <FutureSection 
                future={section.data}
                sectionNumber={section.index}
                onExploreClick={() => onFutureClick(section.id)}
              />
            )}
            {section.type === "next-chapter" && (
              <NextChapterSection />
            )}
          </div>
        ))}
      </div>

      {/* Global Next button - only when not on the last section */}
      {currentSection < sections.length - 1 && (
        <button
          onClick={() => scrollToNextSection(currentSection)}
          className="group fixed right-16 bottom-6 w-[80px] h-[160px] 
                   border border-white/20 bg-transparent 
                   flex flex-col items-center justify-between 
                   py-6 px-[16px] z-[1000] 
                   transition-all duration-500 ease-out
                   hover:border-white/50 
                   active:border-white/80 
                   cursor-pointer"
        >
          {/* Next label */}
          <div className="text-white text-[18px] font-semibold text-center tracking-none">
            Next
          </div>

          {/* Arrow icon */}
          <img
            src="/images/arrow-next.svg"
            alt="Next"
            className="w-8 h-8 mt-2 transition-transform duration-500 ease-out group-hover:translate-y-2"
          />

          {/* Bottom separator */}
          <div className="absolute bottom-0 w-full h-[1px] group-hover:h-[4px] bg-white transition-all duration-500 ease-out" />
        </button>
      )}
    </div>
  );
}
