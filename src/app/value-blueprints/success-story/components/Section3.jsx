"use client";

import React, { useState } from "react";
import LayerDetailModal from "./LayerDetailModal";

export default function Section3({ storyData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);

  const handleLayerClick = (layerIndex) => {
    setSelectedLayerIndex(layerIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <section className="relative w-full bg-black text-white min-h-screen py-10 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8 xl:px-12 border-t border-white/10 flex items-center" style={{ position: 'relative', zIndex: 5 }}>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 
          className="text-center text-[28px] md:text-[36px] lg:text-[48px] font-bold text-white mb-8 md:mb-10 lg:mb-12 leading-none tracking-[-0.05em] max-w-[1024px] mx-auto px-4"
        >
          {storyData.section3.title}
        </h2>

        {/* 上面的 subsection */}
        <div className="mb-9">
          <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16 lg:items-start">
            {/* 左侧：Identified 文本 */}
            <div className="max-w-[400px] mb-8 lg:mb-0">
              <h3 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold text-white mb-2" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                {storyData.section3.identified.title}
              </h3>
              <p className="text-[16px] md:text-[18px] lg:text-[20px] text-white leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                {storyData.section3.identified.description}
              </p>
            </div>

            {/* 右侧：7 个 layer rows */}
            <div className="flex-1">
              <div className="space-y-2">
                  {/* Customer */}
                  <div 
                    className={`flex items-center gap-4 px-4 md:!h-16 ${storyData.id !== 'retail' ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                    style={{ minHeight: '48px', height: 'auto' }}
                    onClick={storyData.id !== 'retail' ? () => handleLayerClick(0) : undefined}
                  >
                    <img 
                      src="/images/value-blueprints/ss-constituent.png" 
                      alt="Customer"
                      className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[18px] md:text-[20px] lg:text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#D3F4DC' }}>
                      Customer
                    </span>
                    {storyData.id !== 'retail' && (
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0 w-10 h-10 md:w-12 md:h-12">
                      <span className="text-white text-[16px] md:text-[18px] lg:text-[20px]">+</span>
                    </div>
                    )}
                  </div>
                  {/* Workforce */}
                  <div 
                    className={`flex items-center gap-4 px-4 md:!h-16 ${storyData.id !== 'retail' ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                    style={{ minHeight: '48px', height: 'auto' }}
                    onClick={storyData.id !== 'retail' ? () => handleLayerClick(1) : undefined}
                  >
                    <img 
                      src="/images/value-blueprints/ss-workforce.png" 
                      alt="Workforce"
                      className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[18px] md:text-[20px] lg:text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#6DDEDC' }}>
                      Workforce
                    </span>
                    {storyData.id !== 'retail' && (
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0 w-10 h-10 md:w-12 md:h-12">
                      <span className="text-white text-[16px] md:text-[18px] lg:text-[20px]">+</span>
                    </div>
                    )}
                  </div>
                  
                  {/* Processes */}
                  <div 
                    className={`flex items-center gap-4 px-4 md:!h-16 ${storyData.id !== 'retail' ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                    style={{ minHeight: '48px', height: 'auto' }}
                    onClick={storyData.id !== 'retail' ? () => handleLayerClick(2) : undefined}
                  >
                    <img 
                      src="/images/value-blueprints/ss-processes.png" 
                      alt="Processes"
                      className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[18px] md:text-[20px] lg:text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#73BAF0' }}>
                      Processes
                    </span>
                    {storyData.id !== 'retail' && (
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0 w-10 h-10 md:w-12 md:h-12">
                      <span className="text-white text-[16px] md:text-[18px] lg:text-[20px]">+</span>
                    </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 水平分割线 */}
        <div className="border-t border-white/50 my-9"></div>

        {/* 下面的 subsection */}
        <div>
          <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16 lg:items-start">
            {/* 左侧：Designed 文本 */}
            <div className="max-w-[400px] mb-8 lg:mb-0">
              <h3 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold text-white mb-2" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                {storyData.section3.designed.title}
              </h3>
              <p className="text-[16px] md:text-[18px] lg:text-[20px] text-white leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                {storyData.section3.designed.description}
              </p>
            </div>

            {/* 右侧：Trust, Intelligence, Agentic Platform, System of Records */}
            <div className="flex-1">
              <div className="space-y-2">
                  {/* Trust */}
                  <div 
                    className={`flex items-center gap-4 px-4 md:!h-16 ${storyData.id !== 'retail' ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                    style={{ minHeight: '48px', height: 'auto' }}
                    onClick={storyData.id !== 'retail' ? () => handleLayerClick(3) : undefined}
                  >
                    <img 
                      src="/images/value-blueprints/ss-trust.png" 
                      alt="Trust"
                      className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[18px] md:text-[20px] lg:text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#E734BB' }}>
                      Trust
                    </span>
                    {storyData.id !== 'retail' && (
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0 w-10 h-10 md:w-12 md:h-12">
                      <span className="text-white text-[16px] md:text-[18px] lg:text-[20px]">+</span>
                    </div>
                    )}
                  </div>
                  
                  {/* Intelligence */}
                  <div 
                    className={`flex items-center gap-4 px-4 md:!h-16 ${storyData.id !== 'retail' ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                    style={{ minHeight: '48px', height: 'auto' }}
                    onClick={storyData.id !== 'retail' ? () => handleLayerClick(4) : undefined}
                  >
                    <img 
                      src="/images/value-blueprints/ss-intelligence.png" 
                      alt="Intelligence"
                      className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[18px] md:text-[20px] lg:text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#FF4136' }}>
                      Intelligence
                    </span>
                    {storyData.id !== 'retail' && (
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0 w-10 h-10 md:w-12 md:h-12">
                      <span className="text-white text-[16px] md:text-[18px] lg:text-[20px]">+</span>
                    </div>
                    )}
                  </div>
                
                  {/* Agentic Platform */}
                  <div 
                    className={`flex items-center gap-4 px-4 md:!h-16 ${storyData.id !== 'retail' ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                    style={{ minHeight: '48px', height: 'auto' }}
                    onClick={storyData.id !== 'retail' ? () => handleLayerClick(5) : undefined}
                  >
                    <img 
                      src="/images/value-blueprints/ss-agentic-platform.png" 
                      alt="Agentic Platform"
                      className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[18px] md:text-[20px] lg:text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#FF6D01' }}>
                      Agentic Platform
                    </span>
                    {storyData.id !== 'retail' && (
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0 w-10 h-10 md:w-12 md:h-12">
                      <span className="text-white text-[16px] md:text-[18px] lg:text-[20px]">+</span>
                    </div>
                    )}
                  </div>
                  
                  {/* System of Records */}
                  <div 
                    className={`flex items-center gap-4 px-4 md:!h-16 ${storyData.id !== 'retail' ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                    style={{ minHeight: '48px', height: 'auto' }}
                    onClick={storyData.id !== 'retail' ? () => handleLayerClick(6) : undefined}
                  >
                    <img 
                      src="/images/value-blueprints/ss-system-of-records.png" 
                      alt="System of Records"
                      className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[18px] md:text-[20px] lg:text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#FFE600' }}>
                      System of Records
                    </span>
                    {storyData.id !== 'retail' && (
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0 w-10 h-10 md:w-12 md:h-12">
                      <span className="text-white text-[16px] md:text-[18px] lg:text-[20px]">+</span>
                    </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Detail Modal */}
      {storyData.id !== 'retail' && (
      <LayerDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        layerIndex={selectedLayerIndex}
          storyData={storyData}
      />
      )}
    </section>
  );
}

