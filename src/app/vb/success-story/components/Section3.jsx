"use client";

import React, { useState } from "react";
import LayerDetailModal from "./LayerDetailModal";

export default function Section3() {
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
    <section className="relative w-full bg-black text-white min-h-screen py-20 px-6 md:px-8 lg:px-12 border-t border-white/10 flex items-center" style={{ position: 'relative', zIndex: 5 }}>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 
          className="text-center text-[48px] font-bold text-white mb-12 leading-none tracking-[-0.05em] max-w-[1024px] mx-auto"
        >
          How we leverage EY.ai Value Blueprint to transform Quote-to-Cash
        </h2>

        {/* 上面的 subsection */}
        <div className="mb-9">
          <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16 lg:items-center">
            {/* 左侧：Identified 文本 */}
            <div className="max-w-[400px] mb-8 lg:mb-0">
              <h3 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold text-white mb-2" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                Identified
              </h3>
              <p className="text-[16px] md:text-[18px] lg:text-[20px] text-white leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                a starting point for redesign within the global process based on value potential, that prioritized capabilities and enabled AI with humans in the loop future
              </p>
            </div>

            {/* 右侧：7 个 layer rows */}
            <div className="flex-1 pl-4 border-l-2 border-white">
              <div className="space-y-2">
                {/* 组 1: INTERACTION - Customer 和 Workforce */}
                <div className="space-y-2">
                  {/* 分割线和组名 */}
                  <div className="flex items-center gap-4 my-2">
                    <span className="text-[18px] font-bold uppercase text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                      INTERACTION
                    </span>
                    <div className="flex-1 border-t border-white/20"></div>
                  </div>
                  
                  {/* Customer */}
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors px-4"
                    style={{ height: '64px' }}
                    onClick={() => handleLayerClick(0)}
                  >
                    <img 
                      src="/images/value-blueprints/ss-constituent.png" 
                      alt="Customer"
                      className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#D3F4DC' }}>
                      Customer
                    </span>
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                      <span className="text-white text-[20px]">+</span>
                    </div>
                  </div>
                  {/* Workforce */}
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors px-4"
                    style={{ height: '64px' }}
                    onClick={() => handleLayerClick(1)}
                  >
                    <img 
                      src="/images/value-blueprints/ss-workforce.png" 
                      alt="Workforce"
                      className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#6DDEDC' }}>
                      Workforce
                    </span>
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                      <span className="text-white text-[20px]">+</span>
                    </div>
                  </div>
                </div>
                
                {/* 组 2: PROCESS - Processes */}
                <div className="space-y-2">
                  {/* 分割线和组名 */}
                  <div className="flex items-center gap-4 my-2">
                    <span className="text-[18px] font-bold uppercase text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                      PROCESS
                    </span>
                    <div className="flex-1 border-t border-white/20"></div>
                  </div>
                  
                  {/* Processes */}
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors px-4"
                    style={{ height: '64px' }}
                    onClick={() => handleLayerClick(2)}
                  >
                    <img 
                      src="/images/value-blueprints/ss-processes.png" 
                      alt="Processes"
                      className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#73BAF0' }}>
                      Processes
                    </span>
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                      <span className="text-white text-[20px]">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 下面的 subsection */}
        <div>
          <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16 lg:items-center">
            {/* 左侧：Designed 文本 */}
            <div className="max-w-[400px] mb-8 lg:mb-0">
              <h3 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold text-white mb-2" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                Designed
              </h3>
              <p className="text-[16px] md:text-[18px] lg:text-[20px] text-white leading-relaxed" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                a scalable architecture in collaboration with data and IT teams, to connect and unify work across disparate landscape of enterprise systems, without requiring re-platforming effort
              </p>
            </div>

            {/* 右侧：Trust, Intelligence, Agentic Platform, System of Records */}
            <div className="flex-1 pl-4 border-l-2 border-white">
              <div className="space-y-2">
                {/* 组 1: MIDDLEWARE - Trust */}
                <div className="space-y-2">
                  {/* 分割线和组名 */}
                  <div className="flex items-center gap-4 my-2">
                    <span className="text-[18px] font-bold uppercase text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                      MIDDLEWARE
                    </span>
                    <div className="flex-1 border-t border-white/20"></div>
                  </div>
                  
                  {/* Trust */}
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors px-4"
                    style={{ height: '64px' }}
                    onClick={() => handleLayerClick(3)}
                  >
                    <img 
                      src="/images/value-blueprints/ss-trust.png" 
                      alt="Trust"
                      className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#E734BB' }}>
                      Trust
                    </span>
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                      <span className="text-white text-[20px]">+</span>
                    </div>
                  </div>
                </div>
                
                {/* 组 2: ORCHESTRATION - Intelligence 和 Agentic Platform */}
                <div className="space-y-2">
                  {/* 分割线和组名 */}
                  <div className="flex items-center gap-4 my-2">
                    <span className="text-[18px] font-bold uppercase text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                      ORCHESTRATION
                    </span>
                    <div className="flex-1 border-t border-white/20"></div>
                  </div>
                  
                  {/* Intelligence */}
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors px-4"
                    style={{ height: '64px' }}
                    onClick={() => handleLayerClick(4)}
                  >
                    <img 
                      src="/images/value-blueprints/ss-intelligence.png" 
                      alt="Intelligence"
                      className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#FF4136' }}>
                      Intelligence
                    </span>
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                      <span className="text-white text-[20px]">+</span>
                    </div>
                  </div>
                  {/* Agentic Platform */}
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors px-4"
                    style={{ height: '64px' }}
                    onClick={() => handleLayerClick(5)}
                  >
                    <img 
                      src="/images/value-blueprints/ss-agentic-platform.png" 
                      alt="Agentic Platform"
                      className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#FF6D01' }}>
                      Agentic Platform
                    </span>
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                      <span className="text-white text-[20px]">+</span>
                    </div>
                  </div>
                </div>
                
                {/* 组 3: SYSTEM OF RECORD - System of Records */}
                <div className="space-y-2">
                  {/* 分割线和组名 */}
                  <div className="flex items-center gap-4 my-2">
                    <span className="text-[18px] font-bold uppercase text-white" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
                      SYSTEM OF RECORD
                    </span>
                    <div className="flex-1 border-t border-white/20"></div>
                  </div>
                  
                  {/* System of Records */}
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors px-4"
                    style={{ height: '64px' }}
                    onClick={() => handleLayerClick(6)}
                  >
                    <img 
                      src="/images/value-blueprints/ss-system-of-records.png" 
                      alt="System of Records"
                      className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0"
                      style={{ objectFit: 'contain' }}
                    />
                    <span className="flex-1 text-[24px] font-bold" style={{ fontFamily: 'var(--font-eyinterstate)', color: '#FFE600' }}>
                      System of Records
                    </span>
                    <div className="rounded-full border border-white/50 flex items-center justify-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                      <span className="text-white text-[20px]">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Detail Modal */}
      <LayerDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        layerIndex={selectedLayerIndex}
      />
    </section>
  );
}

