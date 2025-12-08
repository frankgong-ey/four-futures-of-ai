"use client";

import React, { useState, useEffect } from "react";
import MoreBackgroundModal from "./MoreBackgroundModal";

export default function Section1() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 当 modal 打开时禁用背景滚动
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // 清理函数：组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <section 
      className="relative w-full text-white bg-black min-h-screen py-20 pl-[5%] pr-[5%] flex items-center"
      style={{ 
        fontFamily: 'var(--font-eyinterstate)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* 背景图片 - 保持长宽比 */}
      <img 
        src="/images/value-blueprints/ss-tf-hero.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 1 }}
      />

      {/* 内容层 - 最大宽度 1440px，垂直居中 */}
      <div className="relative w-full max-w-[1440px] mx-auto z-10 flex justify-end">
        {/* 黑色/20 bg blur 的内容 div - 右对齐，最大宽度 1024px */}
        <div 
          className="bg-black/40 backdrop-blur-md max-w-[880px] w-full p-8 md:p-12 flex flex-col gap-8 outline outline-white/20"
          style={{ zIndex: 10 }}
        >
          {/* Title Module */}
          <div className="flex items-stretch max-w-[1024px]">
            {/* 垂直渐变边框 */}
            <div
              className="w-[3px] flex-shrink-0"
              style={{
                background: 'linear-gradient(to bottom, #FFDD0B, #FF789B, #34F8FD)',
              }}
            />
            {/* 文案容器 */}
            <div className="pl-6 flex flex-col gap-4">
              <p 
                className="text-[48px] font-normal tracking-[-0.05em] leading-none text-[#FFE601]"
                style={{ fontFamily: 'var(--font-eyinterstate)' }}
              >
                Success Story
              </p>
              <h1 
                className="text-[80px] font-bold leading-none tracking-[-0.05em] text-white"
                style={{ fontFamily: 'var(--font-eyinterstate)' }}
              >
                Life Sciences Quote-to-Cash
              </h1>
            </div>
          </div>

          {/* 描述文本 */}
          <p className="text-[20px] font-normal leading-relaxed text-white">
            A global life sciences conglomerate sought to unlock more value from its fragmented, highly manual Quote-to-Cash process. With a complex system of record landscape, the organization struggled with complex CSR workflows, disconnected communications, and limited end-to-end visibility—creating inefficiencies, compliance risks, and inconsistent experiences. EY partnered with the client to rapidly identify the highest-value parts of the process and reimagine them using the Value Blueprint framework.
          </p>
          
          {/* More background 按钮 - Outline Style */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-6 border border-white/50 hover:bg-white/10 transition-colors cursor-pointer text-white font-bold text-[18px] md:text-[18px] self-start"
          >
            More Background
          </button>
        </div>
      </div>

      {/* More Background Modal */}
      <MoreBackgroundModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}

