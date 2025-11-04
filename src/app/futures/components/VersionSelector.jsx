"use client";

import React from "react";

export default function VersionSelector({ versionName, onChangeClick, isVisible = true }) {
  return (
    <div 
      className={`fixed top-24 left-16 z-50 w-[340px] transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* 第一行：The Four Futures of AI for */}
      <div className="text-white/60 text-sm">
        The Four Futures of AI for
      </div>
      
      {/* 第二行：版本名称和Change按钮，下面有白线 */}
      <div className="flex items-baseline justify-between gap-2 mt-1 relative">
        <span className="text-white text-xl font-medium">
          {versionName}
        </span>
        <button
          onClick={onChangeClick}
          className="text-white/60 text-sm hover:text-white transition-colors cursor-pointer ml-auto"
        >
          Change
        </button>
        {/* 白线 - 在第二行下方 */}
        <div className="absolute bottom-[-4px] left-0 right-0 h-[1px] bg-white" />
      </div>
    </div>
  );
}

