"use client";

import React from "react";

export default function FutureSection({ future, sectionNumber, onExploreClick }) {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* 左侧内容 */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="text-sm text-white/60 font-medium">
              {String(sectionNumber).padStart(2, '0')}
            </div>
            <h2 
              className="text-5xl md:text-7xl font-bold leading-tight"
              style={{ color: future.color }}
            >
              {future.title}
            </h2>
            <p className="text-xl text-white/80 leading-relaxed">
              {future.description}
            </p>
          </div>

          <button
            onClick={onExploreClick}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <span className="text-lg font-medium">Explore this future</span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>
        </div>

        {/* 右侧装饰 */}
        <div className="relative">
          <div 
            className="w-full h-96 rounded-2xl opacity-20"
            style={{ 
              background: `linear-gradient(135deg, ${future.color}20, ${future.color}40)`,
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-32 h-32 rounded-full opacity-30"
                style={{ backgroundColor: future.color }}
              />
            </div>
          </div>
          
          {/* 装饰性线条 */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              <defs>
                <linearGradient id={`gradient-${future.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={future.color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={future.color} stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d="M50,200 Q200,50 350,200 T50,350"
                stroke={`url(#gradient-${future.id})`}
                strokeWidth="2"
                fill="none"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
