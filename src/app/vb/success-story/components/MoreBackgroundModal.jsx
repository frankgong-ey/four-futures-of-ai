"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function MoreBackgroundModal({ isOpen, onClose }) {
  const [currentView, setCurrentView] = useState(0);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const totalViews = 2;

  useEffect(() => {
    if (isOpen) {
      // 开始渲染并触发 fade in
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      // 触发 fade out，然后移除组件
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!shouldRender || !mounted) return null;

  // View 1 数据
  const view1Cards = [
    {
      title: "Leadership Buy-In",
      text: "Leadership eager to transform the process and unlock greater value from their Global Business Services team"
    },
    {
      title: "Mature GBS Team",
      text: "GBS had already migrated QTC process and was working in an end-to-end manner with the business"
    },
    {
      title: "Disparate systems landscape",
      text: "Client ERP landscape consisted of 100+ ERPs, with little appetite for re-platforming"
    }
  ];

  // View 2 数据
  const view2Cards = [
    {
      title: "Human bottlenecks",
      text: "What's possible with AI: Move siloed process owners into a common interface"
    },
    {
      title: "Data Rich, Insight Poor",
      text: "What's possible with AI: Visibility and aggregation of the end-to-end process, connecting multiple business units"
    },
    {
      title: "Latency matters",
      text: "What's possible with AI: Increasing productivity within the process by 50%"
    },
    {
      title: "Complex orchestration",
      text: "What's possible with AI: Connecting landscape of ERPs through single Agentic Orchestration layer"
    },
    {
      title: "High cognitive load",
      text: "What's possible with AI: Self-service tools to support decision making"
    },
    {
      title: "Experience differentiator",
      text: "What's possible with AI: Drives experience consistency in a highly complex business"
    }
  ];

  const handlePrevious = () => {
    if (currentView > 0) {
      setCurrentView(currentView - 1);
    }
  };

  const handleNext = () => {
    if (currentView < totalViews - 1) {
      setCurrentView(currentView + 1);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center transition-opacity duration-300"
      onClick={handleBackdropClick}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        opacity: isVisible ? 1 : 0,
        zIndex: 10000, // 确保在 NavigationBar (z-40) 之上
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Modal 内容 */}
      <div
        className="relative bg-black/95 flex flex-col outline outline-white/50 transition-opacity duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          fontFamily: 'var(--font-eyinterstate)',
          opacity: isVisible ? 1 : 0,
          zIndex: 10001, // 确保内容在遮罩之上
          margin: '64px',
          width: 'calc(100% - 128px)', // 减去左右各 64px
          height: 'calc(100% - 128px)', // 减去上下各 64px
          maxWidth: 'calc(100vw - 128px)',
          maxHeight: 'calc(100vh - 128px)',
        }}
      >

        {/* 可滚动内容区域 */}
        <div className="flex-1 overflow-y-auto p-9 pb-32">
          {/* Header */}
          <div className="mb-8">
            <p
              className="text-[24px] font-normal text-[#FFE601] mb-4"
              style={{ letterSpacing: '-0.05em' }}
            >
              More Background {currentView + 1}/{totalViews}
            </p>
            <h2
              className="text-[36px] font-bold text-white tracking-[-0.05em] leading-tight max-w-[1024px]">
              {currentView === 0
                ? "Why was a global life science conglomerate's Quote-to-Cash process ready for reimagination?"
                : "What factors positioned Quote-to-Cash as a high value candidate for reimagination?"}
            </h2>
          </div>

          {/* View 1: 3 个卡片 */}
          {currentView === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {view1Cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white/10 border border-white/20 rounded-none p-6 flex flex-col gap-4 relative"
                  style={{ height: '360px' }}
                >
                  {/* 上边缘渐变色条 */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{
                      background: 'linear-gradient(to right, #FFDD0B, #FF789B, #34F8FD)',
                    }}
                  />
                  {/* 图标 */}
                  <img
                    src="/images/value-blueprints/bullet-plus.svg"
                    alt="Icon"
                    className="w-8 h-8 flex-shrink-0 mt-3"
                  />
                  {/* 标题 */}
                  <h3 className="text-[24px] font-bold text-white leading-tight">
                    {card.title}
                  </h3>
                  {/* 文本 */}
                  <p className="text-[18px] font-normal text-white leading-relaxed">
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* View 2: 6 个卡片 */}
          {currentView === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {view2Cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white/10 border border-white/20 rounded-none p-6 flex flex-col gap-4 relative"
                >
                  {/* 上边缘渐变色条 */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{
                      background: 'linear-gradient(to right, #FFDD0B, #FF789B, #34F8FD)',
                    }}
                  />
                  {/* Icon 和 Title 水平布局 */}
                  <div className="flex items-start gap-3 mt-3">
                    {/* 图标 */}
                    <img
                      src="/images/value-blueprints/bullet-plus.svg"
                      alt="Icon"
                      className="w-8 h-8 flex-shrink-0"
                    />
                    {/* 标题 */}
                    <h3 className="text-[24px] font-bold text-white leading-tight">
                      {card.title}
                    </h3>
                  </div>
                  {/* 文本 - 左对齐，与 icon 对齐 */}
                  <p className="text-[18px] font-normal text-white leading-relaxed pl-11">
                    <span className="font-bold text-[#FFE601]">What's possible with AI: </span>
                    {card.text.replace("What's possible with AI: ", "")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Row - 底部导航（固定在底部） */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-8 border-t border-white/20 bg-black">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="w-20 h-20 rounded-full bg-black border border-white/50 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* View 切换按钮组合 - 居中 */}
          <div className="flex items-center gap-8">
            {/* 上一个按钮 */}
            <button
              onClick={handlePrevious}
              disabled={currentView === 0}
              className={`w-20 h-20 rounded-full border flex items-center justify-center transition-colors ${
                currentView === 0
                  ? 'border-white/20 cursor-not-allowed opacity-50'
                  : 'border-white/50 hover:bg-white/10 cursor-pointer'
              }`}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* 指示器 */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalViews }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentView
                      ? 'bg-white w-3 h-3'
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* 下一个按钮 */}
            <button
              onClick={handleNext}
              disabled={currentView === totalViews - 1}
              className={`w-20 h-20 rounded-full border flex items-center justify-center transition-colors ${
                currentView === totalViews - 1
                  ? 'border-white/20 cursor-not-allowed opacity-50'
                  : 'border-white/50 hover:bg-white/10 cursor-pointer'
              }`}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* 右侧占位，保持平衡 */}
          <div className="w-20"></div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

