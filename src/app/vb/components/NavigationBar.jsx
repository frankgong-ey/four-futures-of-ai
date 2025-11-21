"use client";

import React, { useState, useEffect, useRef } from "react";

// 定义所有滚动位置
const SCROLL_POSITIONS = [
  { type: 'section', id: 1, name: 'Section 1' },
  { type: 'section', id: 2, name: 'Section 2' },
  { type: 'section', id: 3, name: 'Section 3' },
  { type: 'section', id: 4, name: 'Section 4' },
  { type: 'section5-vh', vh: 1, name: 'Section 5 (1vh)' },
  { type: 'section5-vh', vh: 600, name: 'Section 5 (600vh) - Layer 0' },
  { type: 'section5-vh', vh: 700, name: 'Section 5 (700vh) - Layer 1' },
  { type: 'section5-vh', vh: 800, name: 'Section 5 (800vh) - Layer 2' },
  { type: 'section5-vh', vh: 900, name: 'Section 5 (900vh) - Layer 3' },
  { type: 'section5-vh', vh: 1000, name: 'Section 5 (1000vh) - Layer 4' },
  { type: 'section5-vh', vh: 1100, name: 'Section 5 (1100vh) - Layer 5' },
  { type: 'section5-vh', vh: 1200, name: 'Section 5 (1200vh) - Layer 6' },
  { type: 'section', id: 6, name: 'Section 6' },
  { type: 'section', id: 7, name: 'Section 7' },
  { type: 'section8-vh', vh: 1, name: 'Section 8 (1vh)' },
  { type: 'section8-vh', vh: 101, name: 'Section 8 (101vh)' },
  { type: 'section', id: 9, name: 'Section 9' },
];

// 定义每个位置的滚动持续时间（毫秒）
const SCROLL_DURATIONS = [
  500, // Section 1 -> 2
  500, // Section 2 -> 3
  500, // Section 3 -> 4
  500, // Section 4 -> Section 5 vh=1
  2000, // Section 5 vh=1 -> vh=600
  2000, // Section 5 vh=600 -> vh=700
  2000, // Section 5 vh=700 -> vh=800
  2000, // Section 5 vh=800 -> vh=900
  2000, // Section 5 vh=900 -> vh=1000
  2000, // Section 5 vh=1000 -> vh=1100
  2000, // Section 5 vh=1100 -> vh=1200
  500, // Section 5 vh=1200 -> Section 6
  500, // Section 6 -> Section 7
  500, // Section 7 -> Section 8 vh=1
  2000, // Section 8 vh=1 -> vh=101
  500, // Section 8 vh=101 -> Section 9
];

export default function NavigationBar({ 
  onNavigate, 
  currentPositionIndex,
  isScrolling,
  sectionRefs 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  const handlePrevious = () => {
    if (isScrolling || currentPositionIndex <= 0) return;
    onNavigate(currentPositionIndex - 1);
  };

  const handleNext = () => {
    if (isScrolling || currentPositionIndex >= SCROLL_POSITIONS.length - 1) return;
    onNavigate(currentPositionIndex + 1);
  };

  const handleMenuClick = () => {
    if (isScrolling) return;
    setShowMenu(!showMenu);
  };

  const handleMenuSelect = (index) => {
    if (isScrolling) return;
    setShowMenu(false);
    onNavigate(index);
  };

  const currentPosition = SCROLL_POSITIONS[currentPositionIndex] || SCROLL_POSITIONS[0];

  return (
    <>
      {/* 导航栏 - 固定在左下角，移动端隐藏 */}
      <div 
        className="hidden md:flex fixed bottom-0 left-0 z-[1000] items-center"
        style={{
          fontFamily: 'var(--font-eyinterstate)',
        }}
      >
        <div 
          className="flex items-center border border-gray-400/30"
          style={{
            height: '64px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          {/* 左侧：向上按钮 */}
          <button
            onClick={handlePrevious}
            disabled={isScrolling || currentPositionIndex <= 0}
            className="h-full flex items-center justify-center border-r border-gray-400/30 hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{
              width: '64px',
              pointerEvents: isScrolling ? 'none' : 'auto',
            }}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 6L6 2L10 6" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-gray-400"
              />
            </svg>
          </button>

          {/* 中间：当前章节显示 + 菜单按钮 */}
          <div className="relative h-full" ref={menuRef} style={{ width: '240px' }}>
            <button
              onClick={handleMenuClick}
              disabled={isScrolling}
              className="h-full w-full px-6 flex items-center gap-3 border-r border-gray-400/30 hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                pointerEvents: isScrolling ? 'none' : 'auto',
              }}
            >
                {/* 汉堡菜单图标 - 不等长线条 */}
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  {/* 顶部短线 */}
                  <path 
                    d="M3 4H11" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                  {/* 中间长线 */}
                  <path 
                    d="M2 8H14" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                  {/* 底部短线 */}
                  <path 
                    d="M3 12H11" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* 章节编号和名称 */}
                <span className="text-gray-400 text-sm">
                  {String(currentPositionIndex + 1).padStart(2, '0')}
                </span>
                <span className="text-white text-sm">
                  {currentPosition.name}
                </span>
              </button>

              {/* 章节菜单 */}
              {showMenu && (
                <div 
                  className="absolute bottom-full left-0 mb-1 bg-black/80 backdrop-blur-md border border-gray-400/30 max-h-[400px] overflow-y-auto"
                  style={{ minWidth: '250px' }}
                >
                  {SCROLL_POSITIONS.map((position, index) => (
                    <button
                      key={index}
                      onClick={() => handleMenuSelect(index)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors ${
                        index === currentPositionIndex 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-300'
                      }`}
                      style={{
                        fontFamily: 'var(--font-eyinterstate)',
                        fontSize: '14px',
                      }}
                    >
                      <span className="text-gray-400 mr-2">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {position.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

          {/* 右侧：向下按钮 */}
          <button
            onClick={handleNext}
            disabled={isScrolling || currentPositionIndex >= SCROLL_POSITIONS.length - 1}
            className="h-full flex items-center justify-center hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative"
            style={{
              width: '64px',
              pointerEvents: isScrolling ? 'none' : 'auto',
            }}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 6L6 10L10 6" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-white"
              />
            </svg>
            {/* 底部指示线 */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
            />
          </button>
        </div>
      </div>

      {/* 滚动时禁用交互的遮罩层 */}
      {isScrolling && (
        <div 
          className="fixed inset-0 z-[999] pointer-events-auto"
          style={{
            backgroundColor: 'transparent',
            cursor: 'wait',
          }}
        />
      )}
    </>
  );
}

