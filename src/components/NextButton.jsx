"use client";

import React from 'react';

export default function NextButton() {
  return (
    <div
      className="fixed right-16 bottom-6 w-[80px] h-[160px] border border-white/20 bg-transparent flex flex-col items-center justify-between py-6 px-[16px] z-[1000] pointer-events-auto"
    >
      {/* Start 文本 */}
      <div className="text-white text-[18px] font-semibold text-center tracking-none">
        Next
      </div>

      {/* 向下箭头图标（SVG） */}
      <img
        src="/images/arrow-next.svg"
        alt="Next"
        className="w-8 h-8 mt-2"
      />

      {/* 底部分隔线 */}
      <div className="absolute bottom-0 w-full h-px bg-white mt-4" />
    </div>
  );
}
