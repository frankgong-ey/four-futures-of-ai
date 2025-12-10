"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function LayerDetailModal({ isOpen, onClose, layerIndex, storyData }) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState(layerIndex);
  const totalViews = 7;

  useEffect(() => {
    if (isOpen) {
      setCurrentView(layerIndex);
    }
  }, [isOpen, layerIndex]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  // Layer 配置数据 - 优先使用 storyData，否则使用默认数据
  const defaultLayerData = [
    {
      name: "Customer",
      color: "#D3F4DC",
      image: "/images/value-blueprints/ss-constituent.png",
      inAction: "Singular interface for Customer Service Representatives",
      valueUnlocked: "Increasing the customer deflection rate, allowing CSR's to focus on other actions"
    },
    {
      name: "Workforce",
      color: "#6DDEDC",
      image: "/images/value-blueprints/ss-workforce.png",
      inAction: "Unlocks value of a GBS organization, enabled to work across process instead of within steps",
      valueUnlocked: "Accelerates ability to migrate Quote-to-cash process across a global business strategical into their Global Business Services organization"
    },
    {
      name: "Processes",
      color: "#73BAF0",
      image: "/images/value-blueprints/ss-processes.png",
      inAction: "Reimagined complex and nuanced process across 27 global divisions",
      valueUnlocked: "Accelerated operational efficiency through intelligent automation and AI-enabled processes."
    },
    {
      name: "Trust",
      color: "#E734BB",
      image: "/images/value-blueprints/ss-trust.png",
      inAction: "Lightweight API and event adapters lack heavy point-to-point integrations allowing faster deployment and evolution",
      valueUnlocked: "Ensure outcomes remain secure and explainable"
    },
    {
      name: "Intelligence",
      color: "#FF4136",
      image: "/images/value-blueprints/ss-intelligence.png",
      inAction: "Human-in-the-loop policies, digital control tower governing flows and exceptions",
      valueUnlocked: "Encoded expertise guides consistent, high-quality assessments."
    },
    {
      name: "Agentic Platform",
      color: "#FF6D01",
      image: "/images/value-blueprints/ss-agentic-platform.png",
      inAction: "Agentic orchestration layer connects landscape of ERPs to unify instead of replatform",
      valueUnlocked: "Modular architecture, elastic compute, and real-time orchestration support production-grade AI."
    },
    {
      name: "System of Records",
      color: "#FFE600",
      image: "/images/value-blueprints/ss-system-of-records.png",
      inAction: "Maintains systems of record as single source of truth across the enterprise",
      valueUnlocked: "Ensure interoperability, reliability and compliance."
    }
  ];

  const layerData = storyData?.section3?.layers || defaultLayerData;
  const currentLayer = layerData[currentView] || layerData[0];

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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
        className="relative bg-black/95 w-full h-full flex flex-col outline-none md:outline md:outline-white/50 transition-opacity duration-300 md:max-w-[1024px] md:mx-auto md:my-auto md:max-h-[640px]"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          fontFamily: 'var(--font-eyinterstate)',
          opacity: isVisible ? 1 : 0,
        }}
      >
        {/* 可滚动内容区域 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-9 pb-20 md:pb-24 lg:pb-32">
          {/* Title module - 左上角 */}
          <div className="mb-6 md:mb-8 lg:mb-12">
            <h2 
              className="text-[32px] md:text-[40px] lg:text-[48px] xl:text-[64px] font-bold text-white leading-none tracking-[-0.05em]"
            >
              {currentLayer.name}
            </h2>
          </div>

          {/* 两栏布局 */}
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 xl:gap-12 lg:items-center">
            {/* 左侧：Layer 图片 - 放大 */}
            <div className="flex-shrink-0">
              <img 
                src={currentLayer.image}
                alt={currentLayer.name}
                className="w-full max-w-[280px] md:max-w-[350px] lg:max-w-[400px] xl:max-w-[500px] h-auto object-contain mx-auto lg:mx-0"
              />
            </div>

            {/* 右侧：In Action 和 Value Unlocked */}
            <div className="flex-1 flex flex-col gap-4 md:gap-6 lg:gap-8 xl:gap-12">
              {/* In Action */}
              <div>
                <h3 className="text-[18px] md:text-[22px] lg:text-[24px] xl:text-[32px] font-bold text-white mb-3 md:mb-4">
                  What We Did
                </h3>
                <p className="text-[14px] md:text-[16px] lg:text-[18px] xl:text-[20px] text-white leading-relaxed">
                  {currentLayer.inAction}
                </p>
              </div>

              {/* Value Unlocked */}
              <div>
                <h3 className="text-[18px] md:text-[22px] lg:text-[24px] xl:text-[32px] font-bold text-white mb-3 md:mb-4">
                  Value Unlocked
                </h3>
                <p className="text-[14px] md:text-[16px] lg:text-[18px] xl:text-[20px] text-white leading-relaxed">
                  {currentLayer.valueUnlocked}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Row - 底部导航（固定在底部） */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 md:p-4 lg:p-6 xl:p-8 border-t border-white/20 bg-black">
          {/* 关闭按钮 - 左侧 */}
          <button
            onClick={onClose}
            className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full bg-black border border-white/50 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 md:w-8 md:h-8"
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

          {/* View 切换按钮组合 - 右侧对齐（mobile）或居中（desktop） */}
          <div className="flex items-center gap-4 md:gap-6 lg:gap-8 ml-auto md:mx-auto">
            {/* 上一个按钮 */}
            <button
              onClick={handlePrevious}
              disabled={currentView === 0}
              className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                currentView === 0
                  ? 'border-white/20 cursor-not-allowed opacity-50'
                  : 'border-white/50 hover:bg-white/10 cursor-pointer'
              }`}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 md:w-8 md:h-8"
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
                  className={`w-2 h-2 rounded-full transition-all ${
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
              className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                currentView === totalViews - 1
                  ? 'border-white/20 cursor-not-allowed opacity-50'
                  : 'border-white/50 hover:bg-white/10 cursor-pointer'
              }`}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 md:w-8 md:h-8"
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

          {/* 右侧占位，保持平衡（仅 desktop） */}
          <div className="hidden md:block w-12 lg:w-14 xl:w-16 2xl:w-20"></div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

