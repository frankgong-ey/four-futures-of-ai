"use client";

import React from "react";

export default function Section7() {
  const steps = [
    {
      icon: "/images/value-blueprints/Section7_1.svg",
      number: 1,
      title: "Strategic intent and value",
      description: "Use strategic intent to drive the identification of value levers within a process.",
    },
    {
      icon: "/images/value-blueprints/Section7_2.svg",
      number: 2,
      title: "Process and workforce reimagination",
      description: "Redesign the process with AI, integrating workforce transformation for future readiness.",
    },
    {
      icon: "/images/value-blueprints/Section7_3.png",
      number: 3,
      title: "EY.ai Value Blueprint enablement",
      description: "Lay the foundation needed to realize the future-ready process.",
    },
  ];

  return (
    <section
      className="relative w-full text-white min-h-screen py-20 pl-[5%] pr-[5%] flex items-center"
      style={{ fontFamily: 'var(--font-eyinterstate)', position: 'relative', zIndex: 200, backgroundColor: '#000000' }}
    >
      <div className="max-w-[1440px] mx-auto relative w-full">
        {/* 顶部标题区域 - 与 Section6 一致的结构 */}
        <div className="max-w-[1080px] mx-auto text-center mb-16 flex flex-col items-center gap-4">
          <h2 
            className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white"
          >
            How do we build a blueprint?
          </h2>
          <div 
            className="w-40 h-[3px] mx-auto"
            style={{
              background: 'linear-gradient(to right, #FFDD0B, #FF789B, #34F8FD)',
            }}
          />
        </div>

        {/* 三个步骤卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-[1280px] mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col bg-white/5 border border-white/10 items-center text-center"
              style={{ padding: '36px' }}
            >
              {/* 数字 - 在图片上方，水平居中 */}
              <div className="mb-4 flex justify-center">
                <p 
                  className="text-[48px] md:text-[64px] font-bold text-white"
                  style={{ fontFamily: 'var(--font-eyinterstate)', letterSpacing: 'normal' }}
                >
                  {step.number}
                </p>
              </div>

              {/* 图片 */}
              <div className="mb-6 flex justify-center">
                <img
                  src={step.icon}
                  alt={step.title}
                  className="h-auto object-contain"
                  style={{ maxHeight: '120px', width: 'auto' }}
                />
              </div>

              {/* 标题 */}
              <h3 
                className="text-[24px] md:text-[32px] font-bold mb-4 text-white tracking-[-0.05em] leading-tight text-center"
                style={{ fontFamily: 'var(--font-eyinterstate)' }}
              >
                {step.title}
              </h3>

              {/* 描述 */}
              <p 
                className="text-[14px] md:text-[16px] text-white leading-relaxed text-center"
                style={{ fontFamily: 'var(--font-eyinterstate)' }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
