"use client";

import React from "react";

export default function Section4({ onBack, onMoreStoryClick }) {
  return (
    <section className="relative w-full bg-[#1F1E27] text-white py-12 md:py-16 lg:py-20 px-6 md:px-8 lg:px-12  border-t border-white/10" style={{ position: 'relative', zIndex: 5 }}>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 
          className="text-center text-[36px] md:text-[48px] lg:text-[64px] font-bold text-white mb-12 md:mb-16 leading-none tracking-[-0.05em]"
          style={{ 
            fontFamily: 'var(--font-eyinterstate)',
            display: 'none' // 暂时隐藏
          }}
        >
          More Stories
        </h2>

        {/* Two Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16" style={{ display: 'none' }}>
          {/* Retail Client Card */}
          <div
            onClick={() => onMoreStoryClick('retail')}
            className="relative group cursor-pointer overflow-hidden"
            style={{ 
              minHeight: '400px',
            }}
          >
            {/* Background Image */}
            <img 
              src="/images/value-blueprints/ss-fo-hero.png"
              alt="Retail Client"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: 'blur(3px)',
                transform: 'scale(1.05)',
              }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"></div>
            
            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
              <div>
                {/* Yellow Line */}
                <div 
                  className="w-16 h-[2px] mb-4"
                  style={{ 
                    background: '#FFE600',
                  }}
                />
                {/* Client Name */}
                <p className="text-white/60 text-[16px] md:text-[18px] font-normal mb-2" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  Retail Client
                </p>
                {/* Title */}
                <h3 className="text-[28px] md:text-[36px] lg:text-[48px] font-bold text-white leading-tight tracking-[-0.05em]" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  Watch Design
                </h3>
              </div>
              
              {/* Circular Button */}
              <div className="flex justify-end">
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center group-hover:bg-gray-200 transition-colors"
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M9 18L15 12L9 6" 
                      stroke="black" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* EY Client Zero Card */}
          <div
            onClick={() => onMoreStoryClick('ey-client-zero')}
            className="relative group cursor-pointer overflow-hidden"
            style={{ 
              minHeight: '400px',
            }}
          >
            {/* Background Image */}
            <img 
              src="/images/value-blueprints/ss-ey-hero.png"
              alt="EY Client Zero"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                filter: 'blur(3px)',
                transform: 'scale(1.05)',
              }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"></div>
            
            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
              <div>
                {/* Yellow Line */}
                <div 
                  className="w-16 h-[2px] mb-4"
                  style={{ 
                    background: '#FFE600',
                  }}
                />
                {/* Client Name */}
                <p className="text-white/60 text-[16px] md:text-[18px] font-normal mb-2" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  EY Client Zero
                </p>
                {/* Title */}
                <h3 className="text-[28px] md:text-[36px] lg:text-[48px] font-bold text-white leading-tight tracking-[-0.05em]" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                  Risk Assessment
                </h3>
              </div>
              
              {/* Circular Button */}
              <div className="flex justify-end">
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center group-hover:bg-gray-200 transition-colors"
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M9 18L15 12L9 6" 
                      stroke="black" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="flex justify-center">
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 border border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300 cursor-pointer text-[14px] md:text-[16px] lg:text-[18px] font-bold"
            style={{
              fontFamily: 'var(--font-eyinterstate)',
              backgroundColor: 'transparent',
              color: 'white',
              letterSpacing: '-0.05em',
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </section>
  );
}

