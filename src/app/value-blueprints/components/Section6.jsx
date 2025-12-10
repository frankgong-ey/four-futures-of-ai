"use client";

import React, { useState } from "react";
import ImageModal from "./ImageModal";

export default function Section6() {
  const [modalImages, setModalImages] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (images) => {
    setModalImages(images);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalImages(null);
  };

  // Step 1 的图片
  const step1Images = [
    { src: '/images/value-blueprints/vcm.png', description: 'Value Chain Mapping' },
    { src: '/images/value-blueprints/rrf.png', description: 'Reimagine Readiness Framework' },
  ];

  // Step 2 的图片
  const step2Images = [
    { src: '/images/value-blueprints/ce.png', description: 'Contact Engineering' },
    { src: '/images/value-blueprints/aet.png', description: 'Agentic Enterprise Tech Stack' },
  ];

  return (
    <section
      className="relative w-full text-white min-h-screen py-20 pl-[5%] pr-[5%] flex items-center"
      style={{ fontFamily: 'var(--font-eyinterstate)', position: 'relative', zIndex: 200, backgroundColor: '#1F1E27' }}
    >
      <div className="max-w-[1440px] mx-auto relative w-full">
        {/* 顶部标题区域 - 与 Section2 一致的结构，但没有 overline，title 是白色 */}
        <div className="max-w-[1080px] mx-auto text-center mb-16 flex flex-col items-center gap-4">
          <h2 
            className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white"
          >
            Blueprints stack for compounding value. Each blueprint makes the next one easier.
          </h2>
          <div 
            className="w-40 h-[3px] mx-auto"
            style={{
              background: 'linear-gradient(to right, #FFDD0B, #FF789B, #34F8FD)',
            }}
          />
        </div>

        {/* 下半部分：EY Ready Value Blueprints 模块 */}
        <div 
          className="relative"
          style={{
            background: 'linear-gradient(to right, #2C2B36, #BC991A)',
            minHeight: '300px',
            outline: 'none' // 移除默认的 outline
          }}
        >
          {/* 左侧：文本网格 */}
          <div 
            className="p-6 md:p-8 lg:p-12 flex flex-col" 
            style={{ 
              maxWidth: '100%', 
              width: '100%',
              position: 'relative',
              zIndex: 10
            }}
          >
            {/* 文本网格 - 响应式：移动端2列，桌面端4列（11个卡片），无间距 */}
            <div 
              className="grid grid-cols-2 md:grid-cols-4 flex-1"
              style={{
                maxWidth: '1024px',
                marginLeft: 0,
                marginRight: 'auto',
                position: 'relative',
                zIndex: 10
              }}
            >
              {[
                'Inspire to Buy',
                'Plan to Deliver',
                'Hire to Retire',
                'Record to Report',
                'Order to Cash',
                'Transact to Transform',
                'Engage to Advocate',
                'Innovate to Scale',
                'Procure to Pay',
                'Plan to Perform',
                '...Or Custom Value Blueprints',
              ].map((label, index) => (
                <div
                  key={index}
                  className="flex items-center justify-start gap-4 p-3 md:p-4"
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      flexShrink: 0
                    }}
                  />
                  <p className="text-[20px] text-left text-white leading-tight font-bold">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：抽象图形 - 响应式定位 */}
          <img
            src="/images/value-blueprints/texture.png"
            alt="Value Blueprints Texture"
            className="hidden md:block absolute h-auto object-contain"
            style={{
              right: '24px',
              bottom: '0',
              maxHeight: '300px',
              maxWidth: 'calc(50% - 24px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              zIndex: 1
            }}
          />
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        images={modalImages}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
}

