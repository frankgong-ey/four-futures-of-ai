"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function Section8() {
  const router = useRouter();
  
  const successStories = [
    {
      id: "life-sciences",
      client: "Life sciences client",
      title: "Quote to Cash",
      description: "Unified more than 100 ERPs with an agentic orchestration layer and reimagined process outcomes, delivering more than $100 million in annual cost savings and enabling new experiences",
      backgroundImage: "/images/value-blueprints/ss-tf-hero.png",
    },
    {
      id: "retail",
      client: "Retail client",
      title: "Design to Launch",
      description: "Reimagined design workflows, enabling hyper-personalization and rapid speed to market for new products, powered by IP and generative AI",
      backgroundImage: "/images/value-blueprints/ss-fo-hero.png",
    },
    {
      id: "ey-client-zero",
      client: "EY client zero",
      title: "Source to Pay - risk",
      description: "Transformed a 40-hour manual process into a 15-minute AI-powered workflow, shifting from one-time cost savings to recurring value and new business models",
      backgroundImage: "/images/value-blueprints/ss-ey-hero.png",
    },
  ];
  
  const handleCardClick = (storyId) => {
    // 保存当前 section 信息
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('vb-return-section', '8');
    }
    
    // 跳转到 success-story 页面，带上 client 类型参数
    router.push(`/value-blueprints/success-story?client=${storyId}`);
  };
  
  return (
    <section 
      className="relative w-full text-white min-h-screen py-20 pl-[5%] pr-[5%] flex items-center"
      style={{ 
        fontFamily: 'var(--font-eyinterstate)',
        backgroundColor: '#1F1E27',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="max-w-[1440px] mx-auto relative w-full z-10">
        {/* Title Module - 与 Section4 一致的参数 */}
        <div className="max-w-4xl mx-auto text-center mb-16 flex flex-col items-center gap-4 relative z-20">
          <p className="text-[28px] md:text-[48px] font-normal tracking-[-0.05em] leading-none text-[#FFE601]">
            Success stories
          </p>
          <h2 
            className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white"
          >
            EY.ai Value Blueprints in action
          </h2>
          <div 
            className="w-40 h-[3px] mx-auto"
            style={{
              background: 'linear-gradient(to right, #FFDD0B, #FF789B, #34F8FD)',
            }}
          />
        </div>

        {/* Three Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-[1280px] mx-auto relative z-10">
          {successStories.map((story, index) => {
            return (
            <div
              key={story.id}
              onClick={() => handleCardClick(story.id)}
              className="relative flex flex-col group overflow-hidden cursor-pointer"
              style={{
                opacity: 1,
                pointerEvents: 'auto',
              }}
            >
              {/* Image - 上方 */}
              <div 
                className="w-full"
                style={{
                  height: '240px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={story.backgroundImage}
                  alt={story.client}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load image:', story.backgroundImage);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Content - 下方 */}
              <div className="flex flex-col" style={{ marginTop: '24px' }}>
                {/* Overline - Client */}
                <p 
                  className="text-white/60 mb-2 font-bold tracking-[-0.05em]" 
                  style={{ 
                    fontFamily: 'var(--font-eyinterstate)',
                    fontSize: '28px',
                  }}
                >
                  {story.client}
                </p>
                
                {/* Title */}
                <h3 
                  className="text-white font-bold leading-tight tracking-[-0.05em] mb-4" 
                  style={{ 
                    fontFamily: 'var(--font-eyinterstate)',
                    fontSize: '36px',
                  }}
                >
                  {story.title}
                </h3>
                
                {/* Description */}
                <p 
                  className="text-white font-normal leading-relaxed mb-4" 
                  style={{ 
                    fontFamily: 'var(--font-eyinterstate)',
                    fontSize: '20px',
                  }}
                >
                  {story.description}
                </p>
                
                {/* Learn More Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                      handleCardClick(story.id);
                  }}
                  className="self-start px-6 py-3 border border-white text-white font-bold transition-all"
                  style={{
                    fontFamily: 'var(--font-eyinterstate)',
                    fontSize: '16px',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Learn more
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
