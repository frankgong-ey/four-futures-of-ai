"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import QuestionSummary from "./QuestionSummary";
import useLiveCounts from "../../hooks/useLiveCounts";

// 禁用 SSR，只在客户端渲染（需要 WebGL）
const LiveVotesLinear = dynamic(() => import("./LiveVotesLinear"), { ssr: false });

export default function ResultsPage() {
  const counts = useLiveCounts({ pollMs: 5000 });
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <div className="bg-black relative min-h-screen">
      {/* 背景图层 */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero_gradient.svg)', opacity: 0.5 }}
      />

      {/* 全屏 3D Canvas 图层 */}
      <LiveVotesLinear counts={counts} soundEnabled={soundEnabled} />

      {/* 左下角静态文字和音效按钮 */}
      <div className="absolute bottom-16 left-16 z-30 flex flex-col gap-4">
        {/* 音效开关按钮 */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity cursor-pointer"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {soundEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM15 10l2 2m0 0l2 2m-2-2l-2 2m2-2l2-2" />
            )}
          </svg>
          <span className="text-sm">{soundEnabled ? "Sound On" : "Sound Off"}</span>
        </button>

        {/* All Time Results 文字 */}
        <div>
          <h2 className="text-white text-[20px] font-medium mb-1">All Time Results</h2>
          <p className="text-white/60 text-sm">Since June 5, 2025</p>
        </div>
      </div>

      {/* 内容层 */}
      <div className="relative z-10">
        <QuestionSummary counts={counts} />
      </div>
    </div>
  );
}

