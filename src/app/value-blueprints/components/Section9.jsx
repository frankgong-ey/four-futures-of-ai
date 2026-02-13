"use client";

import React from "react";

export default function Section9() {
  return (
    <section 
      className="relative w-full text-white min-h-screen py-20 pl-[5%] pr-[5%] flex items-center"
      style={{ 
        fontFamily: 'var(--font-eyinterstate)',
        backgroundColor: '#000000',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="max-w-[1440px] mx-auto relative w-full z-10">
        {/* Title Module - 与 Section7 一致的参数 */}
        <div className="max-w-[1080px] mx-auto text-center mb-16 flex flex-col items-center gap-4 relative z-20">
          <h2 
            className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white"
          >
            Bringing it back to value
          </h2>
          <div 
            className="w-40 h-[3px] mx-auto"
            style={{
              background: 'linear-gradient(to right, #FFDD0B, #FF789B, #34F8FD)',
            }}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-[1280px] mx-auto">
          {/* Left Column: Bolt-on AI */}
          <div className="flex flex-col">
            {/* Chart Image */}
            <div className="mb-6">
              <img
                src="/images/value-blueprints/section9_a.png"
                alt="Bolt-on AI Chart"
                className="w-full h-auto object-contain"
              />
            </div>
            
            {/* Description */}
            <p 
              className="text-[16px] md:text-[20px] text-white leading-relaxed"
              style={{ fontFamily: 'var(--font-eyinterstate)' }}
            >
              Use case by use case, capabilities remain siloed, only achieving incremental gains and reaching value plateaus.
            </p>
          </div>

          {/* Right Column: Built-in AI */}
          <div className="flex flex-col">
            {/* Chart Image */}
            <div className="mb-6">
              <img
                src="/images/value-blueprints/section9_b.png"
                alt="Built-in AI Chart"
                className="w-full h-auto object-contain"
              />
            </div>
            
            {/* Description */}
            <p 
              className="text-[16px] md:text-[20px] text-white leading-relaxed"
              style={{ fontFamily: 'var(--font-eyinterstate)' }}
            >
              Blueprint by blueprint, with a cross-functional target, capabilities become reusable, effort decreases, and each function raises as they climb toward a complete transformation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

