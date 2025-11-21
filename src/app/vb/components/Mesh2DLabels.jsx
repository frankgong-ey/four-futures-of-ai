"use client";

import React, { useState, createContext, useContext } from "react";
import { LABEL_DATA } from "./MeshLabels";

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

// 单个 2D 标签组件
export function Mesh2DLabel({ screenPos, text, meshName, isVisible }) {
  const [hovered, setHovered] = useState(false);
  const { activeLabel, setActiveLabel } = useLabelContext();

  if (!isVisible || !screenPos) return null;

  const isActive = activeLabel === meshName;

  const handleToggle = () => {
    if (activeLabel === meshName) {
      setActiveLabel(null);
    } else {
      setActiveLabel(meshName);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 1, // 在 Canvas 之上，但低于 Section2 内容（z-10）
        pointerEvents: 'auto',
      }}
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
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          {/* 外层旋转的虚线圆圈 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: '2px dashed rgba(255, 255, 255, 0.6)',
              animation: 'rotate 8s linear infinite',
              pointerEvents: 'none',
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              position: 'relative',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
              padding: 0,
              margin: 0,
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '16px',
                height: '16px',
                transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              {/* 横线 */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0',
                  width: '100%',
                  height: '2px',
                  backgroundColor: 'white',
                  transform: 'translateY(-50%)',
                }}
              />
              {/* 竖线 */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '0',
                  width: '2px',
                  height: '100%',
                  backgroundColor: 'white',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          </button>
        </div>

        {/* 文字内容 */}
        {isActive && (
          <div
            style={{
              position: 'absolute',
              top: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '280px',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0', // 无圆角
              color: 'white',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'var(--font-eyinterstate)',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              pointerEvents: 'auto',
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
          @keyframes rotate {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }
        `
      }} />
    </div>
  );
}

