"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * 背景竖线组件
 * 在所有页面section中显示，包含6条均匀分布的竖线
 * 在 /vb 页面不显示
 */
export default function BackgroundLines() {
  const pathname = usePathname();
  const isVBTestPage = pathname === '/vb';
  const isSuccessStoryPage = pathname === '/vb/success-story';

  // 在 vb 页面和 success-story 页面不显示背景线
  if (isVBTestPage || isSuccessStoryPage) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 12 }}
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
