"use client";

import React, { useState, useEffect } from "react";

export default function ImageModal({ images, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 当 modal 打开时，重置到第一张图片
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  // 键盘事件处理
  useEffect(() => {
    if (!isOpen || !images || images.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images, onClose]);

  // 阻止 body 滚动，并隐藏导航栏
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // 隐藏导航栏
      const navBar = document.querySelector('[data-navigation-bar]');
      if (navBar) {
        navBar.style.display = 'none';
      }
    } else {
      document.body.style.overflow = '';
      // 显示导航栏
      const navBar = document.querySelector('[data-navigation-bar]');
      if (navBar) {
        navBar.style.display = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
      const navBar = document.querySelector('[data-navigation-bar]');
      if (navBar) {
        navBar.style.display = '';
      }
    };
  }, [isOpen]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 md:p-8"
      onClick={handleBackdropClick}
      style={{
        fontFamily: 'var(--font-eyinterstate)',
      }}
    >
      {/* 图片容器 */}
      <div
        className="relative w-full max-w-[90vw] md:max-w-[800px] mx-auto flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 上一张按钮 - 只在有多张图片时显示 */}
        {hasMultipleImages && (
          <button
            onClick={handlePrevious}
            className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors cursor-pointer z-10 bg-black/30 md:bg-transparent rounded-full md:rounded-none border border-white/50"
            aria-label="Previous image"
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* 图片和描述 */}
        <div className="bg-white rounded-lg overflow-hidden w-full">
          <img
            src={currentImage.src}
            alt={currentImage.alt || currentImage.description}
            className="w-full h-auto object-contain"
            style={{ maxWidth: '800px', maxHeight: '80vh', margin: '0 auto' }}
          />
          {currentImage.description && (
            <div className="px-4 md:px-6 py-3 md:py-4 bg-white border-t border-gray-200">
              <p className="text-sm md:text-base text-gray-800 text-center font-normal">
                {currentImage.description}
              </p>
            </div>
          )}
        </div>

        {/* 下一张按钮 - 只在有多张图片时显示 */}
        {hasMultipleImages && (
          <button
            onClick={handleNext}
            className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors cursor-pointer z-10 bg-black/30 md:bg-transparent rounded-full md:rounded-none border border-white/50"
            aria-label="Next image"
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* 指示器和关闭按钮容器 */}
        <div className="flex flex-col items-center gap-3 mt-4">
          {/* 指示器 - 只在有多张图片时显示 */}
          {hasMultipleImages && (
            <div className="flex items-center justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`transition-all cursor-pointer ${
                    index === currentIndex
                      ? 'w-8 h-1 bg-white'
                      : 'w-1 h-1 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                  style={{
                    borderRadius: '2px',
                  }}
                />
              ))}
            </div>
          )}

          {/* 关闭按钮 - 放在 indicator 下面 */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors cursor-pointer z-10 border border-white/50 rounded-full"
            aria-label="Close"
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

