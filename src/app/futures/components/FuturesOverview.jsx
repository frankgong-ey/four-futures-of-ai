"use client";

import React, { useState } from "react";
import HeroSection from "./HeroSection";
import FutureSection from "./FutureSection";
import NextChapterSection from "./NextChapterSection";

export default function FuturesOverview({ futures, onFutureClick }) {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    { type: "hero", id: "hero" },
    ...futures.map((future, index) => ({ 
      type: "future", 
      id: future.id, 
      data: future,
      index: index + 1
    })),
    { type: "next-chapter", id: "next-chapter" }
  ];

  return (
    <div className="relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20">
        <div className="absolute inset-0 bg-[url('/images/hero_gradient.svg')] bg-cover bg-center opacity-30"></div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        {sections.map((section, index) => (
          <div key={section.id} className="min-h-screen flex items-center justify-center">
            {section.type === "hero" && (
              <HeroSection />
            )}
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

      {/* 右侧导航 */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-20">
        <div className="flex flex-col space-y-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => {
                const element = document.getElementById(`section-${index}`);
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSection === index 
                  ? 'bg-white scale-125' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-6 right-6 z-20">
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors">
            <span className="text-sm">Next</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          <div className="text-sm text-white/60">
            {String(currentSection + 1).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
}
