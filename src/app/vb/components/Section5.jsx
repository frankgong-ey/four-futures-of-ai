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
            top: '120px',
            left: 0,
            right: 0,
            height: '100vh',
            display: 'flex',
            alignItems: showAgenticEnterprise ? 'flex-start' : 'center', // The Agentic Enterprise 靠上，其他垂直居中
            justifyContent: 'flex-start',
            paddingLeft: '5%',
            paddingTop: showAgenticEnterprise ? '5%' : 0, // The Agentic Enterprise 有顶部 padding
            pointerEvents: 'none', // 确保不阻挡Canvas的交互
          }}
        >
        {/* 新第一阶段：The Agentic Enterprise */}
        {showAgenticEnterprise && (
          <div 
            className="px-8"
            style={{
              opacity: 1,
              textAlign: 'left',
              maxWidth: '600px',
            }}
          >
            <h1 
              className="text-[36px] md:text-[64px] font-normal mb-6 tracking-[-0.05em] leading-none"
              style={{ 
                backgroundImage: 'linear-gradient(to right, white, #EAD726)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--font-eyinterstate)' 
              }}
            >
              The Agentic Enterprise
            </h1>
            <p 
              className="text-[16px] md:text-[20px]"
              style={{ color: '#ffffff', fontFamily: 'var(--font-eyinterstate)' }}
            >
              Design the next generation of business models that foresee customer needs and unlock new products, services, and customer journeys.
            </p>
          </div>
        )}
        
        {/* 新第二阶段：The Value Blueprint */}
        {showInitialText && (
          <div 
            className="px-8"
            style={{
              // 200vh时立刻显示，到750vh保持显示，750-800vh淡出
              opacity: currentVh < 750 
                ? 1 
                : Math.max(0, 1 - ((currentVh - 750) / 50)),
              textAlign: 'left',
              maxWidth: '600px',
            }}
          >
            <h1 
              className="text-[36px] md:text-[64px] font-normal mb-6 tracking-[-0.05em] leading-none"
              style={{ 
                backgroundImage: 'linear-gradient(to right, white, #EAD726)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--font-eyinterstate)' 
              }}
            >
              The Value Blueprint
            </h1>
            <p 
              className="text-[16px] md:text-[20px]"
              style={{ color: '#ffffff', fontFamily: 'var(--font-eyinterstate)' }}
            >
              EY's Value Blueprint is a strategic roadmap to help organization transform into an agentic enterprise.
            </p>
          </div>
        )}
        
        {/* Seven interconnected layers 文字 */}
        {showSevenLayersText && (
          <div 
            className="px-8"
            style={{
              // 300-400vh时立刻显示
              opacity: 1,
              textAlign: 'left',
              maxWidth: '640px',
            }}
          >
            <h2 
              className="text-[36px] md:text-[64px] font-normal mb-6 tracking-[-0.05em] leading-none"
              style={{ 
                backgroundImage: 'linear-gradient(to right, white, #EAD726)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--font-eyinterstate)' 
              }}
            >
              Seven interconnected layers
            </h2>
            <p 
              className="text-[16px] md:text-xl tracking-[-0.05em]"
              style={{ color: '#ffffff', fontFamily: 'var(--font-eyinterstate)' }}
            >
              Seven interconnected layers come together to move you from being AI-enabled to AI-native by creating a cohesive approach to AI success.
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
            {/* 大序号 - 20%透明度 */}
            <div 
              className="text-9xl md:text-[200px] font-light mb-4 tracking-[-0.05em]"
              style={{ 
                color: '#ffffff', 
                fontFamily: 'var(--font-eyinterstate)',
                opacity: 0.2,
                lineHeight: 1,
              }}
            >
              {String(currentLayerIndex + 1).padStart(2, '0')}
            </div>
            <h3 
              className="text-[36px] md:text-[64px] font-normal mb-6 tracking-[-0.05em] leading-none"
              style={{ 
                backgroundImage: `linear-gradient(to right, white, ${layerGradientColors[currentLayerIndex]})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--font-eyinterstate)' 
              }}
            >
              {layerInfo[currentLayerIndex].title}
            </h3>
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
      
      {/* 2D HTML 标签 - 只在 Section5 激活且 0-100vh 范围内显示 */}
      {activeSection === 'section5' && currentVh >= 0 && currentVh < 100 && (
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
      
      {/* 调试信息 - 只在Section5激活时显示 - 暂时隐藏 */}
      {false && mounted && (
        <div 
          className="fixed bottom-4 right-4 pointer-events-none"
          style={{
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#ffffff',
            opacity: 0.4,
            zIndex: 101,
          }}
        >
          Section5 Progress: {(scrollProgress * 100).toFixed(2)}% | VH: {(scrollProgress * 1300).toFixed(2)} | Current Layer: {currentLayerIndex >= 0 ? `Layer ${currentLayerIndex + 1}` : 'N/A'}
        </div>
      )}
    </section>
  );
}

