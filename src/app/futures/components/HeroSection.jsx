"use client";

import React from "react";

export default function HeroSection() {
  return (
    <div className="max-w-7xl mx-auto px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
          The Four Futures
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            of AI
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/70 mb-12 leading-relaxed">
          Explore how artificial intelligence will reshape our world across four distinct scenarios
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-sm font-medium">CONSTRAINT</span>
          </div>
          <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-sm font-medium">GROWTH</span>
          </div>
          <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-sm font-medium">TRANSFORMATION</span>
          </div>
          <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-sm font-medium">DISRUPTION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
