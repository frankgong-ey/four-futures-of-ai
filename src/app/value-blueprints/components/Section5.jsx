"use client";

import React, { useState, useEffect } from "react";
import { LabelProvider, Mesh2DLabel } from "./Mesh2DLabels";
import { LABEL_DATA } from "./MeshLabels";

// 每个 layer 的渐变颜色（从白色到指定颜色）
// 移到组件外部，避免每次渲染时重新创建
const layerGradientColors = [
  '#EAD726', // layer1: 黄色
  '#E87729', // layer2
  '#EB5242', // layer3
  '#AE5A9C', // layer4
  '#428ADE', // layer5
  '#5BABA8', // layer6
  '#8BDBDC', // layer7
];

// 每个 layer 的 badge 文本
const layerBadgeTexts = [
  'Reliable data', // layer1
  'Tech stack', // layer2
  'Enterprise knowledge', // layer3
  'Responsible AI, security', // layer4
  'Streamlined, AI first', // layer5
  'Human/AI collaboration', // layer6
  'Customer experience', // layer7
];

export default function Section5({ scrollProgress, mounted, layerInfo, scrollSectionRef, activeSection }) {
  
  const currentVh = scrollProgress * 1300;
  const [labelPositions, setLabelPositions] = useState({});
  
  // 监听坐标更新事件
  useEffect(() => {
    const handlePositionsUpdate = (event) => {
      setLabelPositions(event.detail || {});
    };
    
    window.addEventListener('meshLabelPositions', handlePositionsUpdate);
    return () => {
      window.removeEventListener('meshLabelPositions', handlePositionsUpdate);
    };
  }, []);
  
  // 新第一阶段（0-300vh）：显示"The Agentic Enterprise"
  const showAgenticEnterprise = currentVh < 200;
  
  // 新第二阶段（200-300vh）：显示"The Value Blueprint"，300vh时隐藏
  const showInitialText = currentVh >= 200 && currentVh < 300;
  
  // 调整showSevenLayersText的显示范围，改为350-500vh显示
  const showSevenLayersText = currentVh >= 350 && currentVh < 500;
  const showLayerDetails = currentVh >= 600; // 600vh开始进入逐层查看阶段
  // 每100vh切换一层：600vh=layer0, 700vh=layer1, 800vh=layer2, ...
  const currentLayerIndex = showLayerDetails ? Math.min(6, Math.floor((currentVh - 600) / 100)) : -1;

  return (
    <section
      ref={scrollSectionRef}
      className="relative w-full text-white"
      style={{ height: '1300vh', fontFamily: 'var(--font-eyinterstate)', backgroundColor: '#000000' }}
    >
      {/* Canvas已移到GlobalCanvasContainer，这里只保留触发区域 */}
      {/* 这个section作为ScrollTrigger的触发区域 */}

      {/* HTML 内容显示 - sticky定位，覆盖在Canvas之上 */}
      <div 
        className="pointer-events-none sticky top-0"
        style={{ 
          height: 0, // 不占据文档流高度
          width: '100%',
          zIndex: 100, // 提高z-index，确保在Canvas之上
        }}
      >
        {/* 内容包装器 - 绝对定位，覆盖整个视口 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100vh',
            display: 'flex',
            alignItems: 'center', // 垂直居中
            justifyContent: 'flex-start', // 水平左对齐
            paddingLeft: '5%',
            pointerEvents: 'none', // 确保不阻挡Canvas的交互
          }}
        >
        {/* 新第一阶段：The Agentic Enterprise */}
        {showAgenticEnterprise && (
          <div 
            className="px-8 w-full flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12"
            style={{
              opacity: 1,
              textAlign: 'left',
            }}
          >
            {/* 左侧：Title Module + 描述（大屏时与右侧卡片左右排列，宽度固定不收缩） */}
            <div className="flex flex-col w-full max-w-[480px] lg:w-[480px] lg:min-w-[480px] lg:flex-shrink-0">
              {/* Title Module - 与 Section3 一致 */}
              <div className="flex justify-start mb-8">
                <div className="flex items-stretch">
                  {/* 垂直渐变边框 */}
                  <div
                    className="w-[3px]"
                    style={{
                      background: 'linear-gradient(to bottom, #FFDD0B, #FF789B, #34F8FD)',
                    }}
                  />
                  {/* 文案容器 */}
                  <div className="pl-6">
                    <p className="text-[28px] md:text-[48px] font-normal tracking-[-0.05em] leading-none text-[#FFE601] mb-4">
                      The vision
                    </p>
                    <h2 className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white">
                      The agentic enterprise
                    </h2>
                  </div>
                </div>
              </div>

              {/* 描述文本框 */}
              <p 
                className="text-[16px] md:text-[20px] mb-8 lg:mb-0"
                style={{ color: '#ffffff', fontFamily: 'var(--font-eyinterstate)' }}
              >
                Built-in AI provides the building blocks of scalable AI value.
              </p>
            </div>

            {/* 右侧：5个卡片列表（大屏时在 title+描述 右侧；大屏下 2 列布局；最大宽度 640px） */}
            <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-4 min-w-0 lg:flex-1 lg:max-w-[960px]">
              {/* 卡片 1 */}
              <div className="border border-white/10 rounded-none p-3 lg:p-5 flex items-center gap-6 lg:flex-col lg:items-start lg:gap-2 lg:text-left">
                <img
                  src="/images/value-blueprints/s5_ae_1.svg"
                  alt="Bullet"
                  className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0"
                />
                <p className="text-[18px] font-bold leading-relaxed text-white">
                  Interoperable toolsets
                </p>
              </div>

              {/* 卡片 2 */}
              <div className="border border-white/10 rounded-none p-3 lg:p-5 flex items-center gap-6 lg:flex-col lg:items-start lg:gap-2 lg:text-left">
                <img
                  src="/images/value-blueprints/s5_ae_2.svg"
                  alt="Bullet"
                  className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0"
                />
                <p className="text-[18px] font-bold leading-relaxed text-white">
                  Compliance as code
                </p>
              </div>

              {/* 卡片 3 */}
              <div className="border border-white/10 rounded-none p-3 lg:p-5 flex items-center gap-6 lg:flex-col lg:items-start lg:gap-2 lg:text-left">
                <img
                  src="/images/value-blueprints/s5_ae_3.svg"
                  alt="Bullet"
                  className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0"
                />
                <p className="text-[18px] font-bold leading-relaxed text-white">
                  Transparent hybrid workforce
                </p>
              </div>

              {/* 卡片 4 */}
              <div className="border border-white/10 rounded-none p-3 lg:p-5 flex items-center gap-6 lg:flex-col lg:items-start lg:gap-2 lg:text-left">
                <img
                  src="/images/value-blueprints/s5_ae_4.svg"
                  alt="Bullet"
                  className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0"
                />
                <p className="text-[18px] font-bold leading-relaxed text-white">
                  Goal-oriented execution
                </p>
              </div>

              {/* 卡片 5 */}
              <div className="border border-white/10 rounded-none p-3 lg:p-5 flex items-center gap-6 lg:flex-col lg:items-start lg:gap-2 lg:text-left">
                <img
                  src="/images/value-blueprints/s5_ae_5.svg"
                  alt="Bullet"
                  className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0"
                />
                <p className="text-[18px] font-bold leading-relaxed text-white">
                  Work advances itself; humans focus on judgment and innovation
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 新第二阶段：The Value Blueprint */}
        {showInitialText && (
          <div 
            className="px-8 w-full max-w-[480px]"
            style={{
              // 200vh时立刻显示，到750vh保持显示，750-800vh淡出
              opacity: currentVh < 750 
                ? 1 
                : Math.max(0, 1 - ((currentVh - 750) / 50)),
              textAlign: 'left',
            }}
          >
            {/* Title Module - 与第一阶段一致 */}
            <div className="flex justify-start mb-8">
              <div className="flex items-stretch">
                {/* 垂直渐变边框 */}
                <div
                  className="w-[3px]"
                  style={{
                    background: 'linear-gradient(to bottom, #FFDD0B, #FF789B, #34F8FD)',
                  }}
                />
                {/* 文案容器 */}
                <div className="pl-6">
                  <p className="text-[28px] md:text-[48px] font-normal tracking-[-0.05em] leading-none text-[#FFE601] mb-4">
                    The solution
                  </p>
                    <h2 
                      className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white"
                      style={{ textShadow: '0 0 24px rgba(0, 0, 0, 0.8)' }}
                    >
                      EY.ai Value Blueprints
                    </h2>
                </div>
              </div>
            </div>

            {/* 描述文本框 */}
            <p 
              className="text-[16px] md:text-[20px]"
              style={{ color: '#ffffff', fontFamily: 'var(--font-eyinterstate)' }}
            >
              The EY layered AI methodology and library of ready-made Value Blueprints guide transformation into an agentic enterprise — blueprint by blueprint.
            </p>
          </div>
        )}
        
        {/* Seven interconnected layers 文字 */}
        {showSevenLayersText && (
          <div 
            className="px-8 w-full max-w-[480px]"
            style={{
              // 300-400vh时立刻显示
              opacity: 1,
              textAlign: 'left',
            }}
          >
            {/* Title Module - 与前面阶段一致 */}
            <div className="flex justify-start mb-8">
              <div className="flex items-stretch">
                {/* 垂直渐变边框 */}
                <div
                  className="w-[3px]"
                  style={{
                    background: 'linear-gradient(to bottom, #FFDD0B, #FF789B, #34F8FD)',
                  }}
                />
                {/* 文案容器 */}
                <div className="pl-6">
                  <p className="text-[28px] md:text-[48px] font-normal tracking-[-0.05em] leading-none text-[#FFE601] mb-4">
                    The solution
                  </p>
                  <h2 className="text-[36px] md:text-[64px] font-bold leading-none tracking-[-0.05em] text-white">
                    Seven interconnected layers
                  </h2>
                </div>
              </div>
            </div>

            {/* 描述文本框 */}
            <p 
              className="text-[16px] md:text-[20px]"
              style={{ color: '#ffffff', fontFamily: 'var(--font-eyinterstate)' }}
            >
              7 interconnected execution layers drive a cohesive, scalable approach.
            </p>
          </div>
        )}
        
        {/* Layer 详情显示 */}
        {showLayerDetails && currentLayerIndex >= 0 && currentLayerIndex < 7 && (
          <div 
            className="px-8"
            style={{
              opacity: 1,
              textAlign: 'left',
              maxWidth: '640px',
            }}
          >
            {/* 序号与横线左右并列 */}
            <div
              className="mb-4"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                width: '100%',
              }}
            >
              <div 
                className="text-[80px] font-bold tracking-[-0.05em] flex-shrink-0"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.2)',
                  fontFamily: 'var(--font-eyinterstate)',
                  lineHeight: 1,
                }}
              >
                {String(currentLayerIndex + 1).padStart(2, '0')}
              </div>
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  backgroundColor: layerGradientColors[currentLayerIndex],
                }}
              />
            </div>
            <h3 
              className="text-[36px] md:text-[64px] font-bold mb-6 tracking-[-0.05em] leading-none"
              style={{ 
                color: '#ffffff',
                fontFamily: 'var(--font-eyinterstate)' 
              }}
            >
              {layerInfo[currentLayerIndex].title}
            </h3>
            {/* Badge - 白色文字，无边框，无 padding */}
            <div 
              className="inline-flex items-center justify-start mb-6"
            >
              <span 
                className="text-white text-[16px] md:text-[20px] font-bold"
                style={{ fontFamily: 'var(--font-eyinterstate)' }}
              >
                {layerBadgeTexts[currentLayerIndex]}
              </span>
            </div>
            <p 
              className="text-[16px] md:text-[20px]"
              style={{ color: '#ffffff', fontFamily: 'var(--font-eyinterstate)' }}
            >
              {layerInfo[currentLayerIndex].description}
            </p>
          </div>
        )}
        </div>
      </div>
      
      {/* 2D HTML 标签 - 已隐藏 */}
      {false && activeSection === 'section5' && currentVh >= 0 && currentVh < 100 && (
        <LabelProvider>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 2, // 在 Canvas 之上（Canvas z-index: 1），但低于 Section2 内容（z-10）
            }}
          >
            {LABEL_DATA.map(({ meshName, text }) => {
              const screenPos = labelPositions[meshName];
              if (!screenPos) return null;
              
              return (
                <Mesh2DLabel
                  key={meshName}
                  screenPos={screenPos}
                  text={text}
                  meshName={meshName}
                  isVisible={true}
                />
              );
            })}
          </div>
        </LabelProvider>
      )}
      
      {/* 调试信息 - 右下角显示 */}
      {mounted && (
        <div 
          className="fixed bottom-4 right-4 pointer-events-none"
          style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#ffffff',
            opacity: 0.6,
            zIndex: 101,
            lineHeight: '1.2',
            display: 'none', // 暂时隐藏 debug 信息
          }}
        >
          <div>Progress: {(scrollProgress * 100).toFixed(2)}%</div>
          <div>VH: {(scrollProgress * 1300).toFixed(2)}</div>
          <div>Layer: {currentLayerIndex >= 0 ? `${currentLayerIndex + 1}` : 'N/A'}</div>
          <div>Show Agentic: {showAgenticEnterprise ? 'Y' : 'N'}</div>
          <div>Show Initial: {showInitialText ? 'Y' : 'N'}</div>
          <div>Show Seven: {showSevenLayersText ? 'Y' : 'N'}</div>
          <div>Show Details: {showLayerDetails ? 'Y' : 'N'}</div>
        </div>
      )}
    </section>
  );
}

