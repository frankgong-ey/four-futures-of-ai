"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

// 定义所有滚动位置
const SCROLL_POSITIONS = [
  { type: 'section', id: 1, name: 'Section 1' },
  { type: 'section', id: 2, name: 'Section 2' },
  { type: 'section', id: 3, name: 'Section 3' },
];

// 定义 Chapter 映射
const CHAPTERS = [
  { name: 'Home', startIndex: 0, endIndex: 0 }, // Section 1
  { name: 'The Outcome', startIndex: 1, endIndex: 1 }, // Section 2
  { name: 'The Process', startIndex: 2, endIndex: 2 }, // Section 3
];

// 根据 position index 获取对应的 chapter
const getChapterByPositionIndex = (positionIndex) => {
  return CHAPTERS.find(chapter => 
    positionIndex >= chapter.startIndex && positionIndex <= chapter.endIndex
  ) || CHAPTERS[0];
};

// 定义每个位置的滚动持续时间（毫秒）
const SCROLL_DURATIONS = [
  500, // Section 1 -> 2
  500, // Section 2 -> 3
];

export default function NavigationBar({ 
  onNavigate, 
  currentPositionIndex,
  isScrolling,
  sectionRefs,
  onBack
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

  const handleMenuSelect = (chapterIndex) => {
    if (isScrolling) return;
    setShowMenu(false);
    // 跳转到该 chapter 的第一个位置
    const chapter = CHAPTERS[chapterIndex];
    onNavigate(chapter.startIndex);
  };

  const currentPosition = SCROLL_POSITIONS[currentPositionIndex] || SCROLL_POSITIONS[0];
  
  // 使用 useMemo 优化 chapter 查找
  const currentChapter = useMemo(() => {
    return getChapterByPositionIndex(currentPositionIndex);
  }, [currentPositionIndex]);
  
  // 使用 useMemo 优化 chapter 索引查找
  const currentChapterIndex = useMemo(() => {
    return CHAPTERS.findIndex(ch => ch.name === currentChapter.name);
  }, [currentChapter.name]);
  
  // 使用 useMemo 优化进度计算
  const currentChapterProgress = useMemo(() => {
    if (currentPositionIndex < currentChapter.startIndex) return 0;
    if (currentPositionIndex > currentChapter.endIndex) return 1;
    const totalPositions = currentChapter.endIndex - currentChapter.startIndex + 1;
    const currentPositionInChapter = currentPositionIndex - currentChapter.startIndex + 1;
    return currentPositionInChapter / totalPositions;
  }, [currentPositionIndex, currentChapter.startIndex, currentChapter.endIndex]);

  return (
    <>
      {/* 导航栏 - 固定在左下角，移动端隐藏 */}
      <div 
        data-navigation-bar
        className="hidden md:flex fixed bottom-0 left-0 z-40 items-center"
        style={{
          fontFamily: 'var(--font-eyinterstate)',
          zIndex: 40, // 明确设置，确保低于 modals (z-10000)
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
          {/* 最左侧：Quit 按钮 */}
          <button
            onClick={onBack}
            disabled={isScrolling}
            className="h-full flex items-center justify-center gap-2 px-4 border-r border-gray-400/30 hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{
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
                d="M7.5 2L4.5 6L7.5 10" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-white"
              />
            </svg>
            <span className="text-white text-sm font-bold">Quit</span>
          </button>

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
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">
                      {String(currentChapterIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="text-white text-sm">
                      {currentChapter.name}
                    </span>
                  </div>
                  {/* 进度条 */}
                  <div 
                    className="w-full bg-gray-700/50 rounded-full overflow-hidden"
                    style={{ height: '1px', minHeight: '1px' }}
                  >
                    <div 
                      className="h-full bg-white transition-all duration-300"
                      style={{ 
                        width: `${currentChapterProgress * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </button>

              {/* 章节菜单 */}
              {showMenu && (
                <div 
                  className="absolute bottom-full left-0 mb-1 bg-black/80 backdrop-blur-md border border-gray-400/30 max-h-[400px] overflow-y-auto"
                  style={{ minWidth: '250px' }}
                >
                  {CHAPTERS.map((chapter, chapterIndex) => {
                    const isCurrentChapter = currentPositionIndex >= chapter.startIndex && currentPositionIndex <= chapter.endIndex;
                    return (
                      <button
                        key={chapterIndex}
                        onClick={() => handleMenuSelect(chapterIndex)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors cursor-pointer ${
                          isCurrentChapter
                            ? 'bg-gray-800 text-white' 
                            : 'text-gray-300'
                        }`}
                        style={{
                          fontFamily: 'var(--font-eyinterstate)',
                          fontSize: '14px',
                        }}
                      >
                        <span className="text-gray-400 mr-2">
                          {String(chapterIndex + 1).padStart(2, '0')}
                        </span>
                        {chapter.name}
                      </button>
                    );
                  })}
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

