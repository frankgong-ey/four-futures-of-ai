"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function NextChapterSection() {
  const router = useRouter();

  const handleGoToVote = () => {
    router.push('/vote');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-4xl md:text-6xl font-bold mb-8">
          Ready to vote?
        </h2>
        
        <p className="text-xl md:text-2xl text-white/70 mb-12 leading-relaxed">
          Cast your vote for the future you believe in and see how your choice compares with others
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="text-5xl mb-4">🗳️</div>
            <h3 className="text-lg font-semibold mb-2">Share Your Vision</h3>
            <p className="text-sm text-white/60">Make your voice heard in shaping the AI future</p>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">See Real-Time Results</h3>
            <p className="text-sm text-white/60">View how others are preparing for each scenario</p>
          </div>
        </div>

        <div className="pt-8">
          <button 
            onClick={handleGoToVote}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            <span className="text-lg font-medium">Cast Your Vote</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
