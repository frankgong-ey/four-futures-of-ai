"use client";

import React, { useState, createContext, useContext } from "react";
import { Html } from "@react-three/drei";

// 标签数据配置
export const LABEL_DATA = [
  {
    meshName: "ae-ai",
    text: "Powered by agent OS, a unified human-AI collaborative model activates a transparent hybrid workforce"
  },
  {
    meshName: "cube217",
    text: "Goal-oriented execution where work progresses itself in a continuous delivery model"
  },
  {
    meshName: "Icosphere016",
    text: "Compliance as code and trust by design embed traceability so organizations can move fast with confidence"
  },
  {
    meshName: "ae-data",
    text: "AI runs on codified enterprise knowledge, amplifying human and organizational intelligence"
  },
  {
    meshName: "ae-gear",
    text: "Interoperable and reusable toolset builds the agentic foundation so AI can scale cross functionally"
  },
  {
    meshName: "cube218",
    text: "Self-generating software allows for tech stack consolidation and on-demand toolsets"
  }
];

// 创建共享的 activeLabel 状态上下文
const LabelContext = createContext(null);

export function LabelProvider({ children }) {
  const [activeLabel, setActiveLabel] = useState(null);
  return (
    <LabelContext.Provider value={{ activeLabel, setActiveLabel }}>
      {children}
    </LabelContext.Provider>
  );
}

export function useLabelContext() {
  return useContext(LabelContext);
}

// 单个标签组件
export function MeshLabel({ mesh, text, meshName, isVisible }) {
  const [hovered, setHovered] = useState(false);
  const { activeLabel, setActiveLabel } = useLabelContext();

  if (!mesh || !isVisible) return null;

  const isActive = activeLabel === meshName;

  const handleToggle = () => {
    if (activeLabel === meshName) {
      setActiveLabel(null);
    } else {
      setActiveLabel(meshName);
    }
  };

  return (
    <Html
      position={[0, 0, 0]}
      center
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
      transform
      occlude
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* 圆圈加号按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
            padding: 0,
            margin: 0,
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              lineHeight: 1,
              transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            +
          </span>
        </button>

        {/* 文字内容 */}
        {isActive && (
          <div
            style={{
              position: 'absolute',
              top: '44px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '280px',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'var(--font-eyinterstate)',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              pointerEvents: 'auto',
              zIndex: 1000,
              animation: 'fadeIn 0.3s ease',
            }}
          >
            {text}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `
      }} />
    </Html>
  );
}

