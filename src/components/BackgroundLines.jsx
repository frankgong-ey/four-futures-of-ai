"use client";

import React from 'react';

/**
 * 背景竖线组件
 * 在所有页面section中显示，包含6条均匀分布的竖线
 */
export default function BackgroundLines() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {/* 竖线容器 - 全屏高度，左右padding在desktop下64px */}
      <div className="h-screen px-0 md:px-16 flex justify-between items-stretch">
        {/* 6条竖线，均匀分布 */}
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="w-px bg-white opacity-10"
            style={{ height: '100vh' }}
          />
        ))}
      </div>
    </div>
  );
}
