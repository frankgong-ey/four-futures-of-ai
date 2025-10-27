"use client";

import React from "react";

export default function FutureSection({ future, sectionNumber, onExploreClick }) {
  return (
    <div className="pl-16">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="text-[80px] text-white/40 font-bold">
            {String(sectionNumber).padStart(2, '0')}
          </div>
          <h2 
            className="text-5xl md:text-[120px] font-bold leading-tight"
            style={{ 
              background: `linear-gradient(to right, #FFFFFF, ${future.color})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {future.title}
          </h2>
          <p className="text-xl text-white/80 leading-relaxed">
            {future.description}
          </p>
        </div>

        <button
          onClick={onExploreClick}
          className="group inline-flex items-center space-x-3 px-8 py-8 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
        >
          <span className="text-lg font-medium">Explore this future</span>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
