"use client";

import React from "react";

export default function FutureSection({ future, sectionNumber, onExploreClick }) {
  // Extract base type from future.id and map it to the logo file
  const getFutureLogo = (futureId) => {
    if (!futureId) return null;

    // Extract base type (e.g., from "constraint-cp" to "constraint")
    const parts = futureId.split('-');
    const baseType = parts[0]; // constraint, growth, transform, collapse

    // Map to the logo file
    const logoMap = {
      'constraint': 'constraint-logo',
      'growth': 'growth-logo',
      'transform': 'transform-logo',
      'collapse': 'collapse-logo'
    };

    const logoName = logoMap[baseType];
    return logoName ? `/images/${logoName}.svg` : null;
  };

  const logoPath = getFutureLogo(future.id);

  return (
    <div className="pl-16">
      {/* Wrap all elements in a container with blurred background */}
      <div 
        className="space-y-8 px-8 pt-8 pb-0 w-full md:w-[800px]"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[64px] text-white/20 font-bold">
              {String(sectionNumber).padStart(2, '0')}
            </div>
            {logoPath && (
              <img 
                src={logoPath} 
                alt="Future logo" 
                className="w-16 h-16 opacity-80"
              />
            )}
          </div>
          <h2 
            className="text-5xl md:text-[96px] font-light leading-tight"
            style={{ 
              background: `linear-gradient(to right, #FFFFFF, ${future.color})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.05em' // tighter letter spacing
            }}
          >
            {future.title}
          </h2>
          <div className="text-xl text-white/80 leading-relaxed space-y-4">
            {Array.isArray(future.description) ? (
              future.description.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))
            ) : (
              <p>{future.description}</p>
            )}
          </div>
        </div>

        <button
          onClick={onExploreClick}
          className="group inline-flex items-center space-x-3 px-8 py-8 bg-white/90 border border-white/20 hover:bg-white/100 transition-all duration-300 cursor-pointer"
        >
          <span className="text-lg font-medium text-[#131313]">Explore this future</span>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="#131313" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
