'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';

const LineAnimation = forwardRef(function LineAnimation({ onAnimationComplete }, ref) {
  // SVG线条的refs
  const diagonalRefs = useRef([]);
  const horizontalRef1 = useRef(null);
  const horizontalRef2 = useRef(null);
  const verticalRef = useRef(null);
  const verticalRef2 = useRef(null);

  // 处理线条延伸动画
  const animateLines = () => {
    // 斜线动画
    diagonalRefs.current.forEach((line, i) => {
      if (line) {
        const x1 = parseFloat(line.getAttribute('x1')) || 0;
        const y1 = parseFloat(line.getAttribute('y1')) || 0;
        const x2 = parseFloat(line.getAttribute('x2')) || 0;
        const y2 = parseFloat(line.getAttribute('y2')) || 0;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const factor = 4; // 总长度放大倍数
        // 围绕中点对称扩展：
        const expand = (factor - 1) / 2;
        const targetX1 = x1 - dx * expand;
        const targetY1 = y1 - dy * expand;
        const targetX2 = x2 + dx * expand;
        const targetY2 = y2 + dy * expand;

        gsap.to(line, {
          attr: { 
            x1: targetX1,
            y1: targetY1,
            x2: targetX2, 
            y2: targetY2,
            strokeWidth: 3
          },
          duration: 1.2,
          ease: "power2.out",
          delay: i * 0.05
        });
      }
    });
    
    // 水平线：与斜线同样的"按比例加长"方式（围绕中点对称扩展）
    [horizontalRef1, horizontalRef2].forEach((ref, idx) => {
      if (ref.current) {
        const line = ref.current;
        const x1 = parseFloat(line.getAttribute('x1')) || 0;
        const x2 = parseFloat(line.getAttribute('x2')) || 0;
        const dx = x2 - x1;
        const factor = 10; // 与斜线一致：放大到原长度的3倍
        const expand = (factor - 1) / 2;
        let targetX1 = x1 - dx * expand;
        let targetX2 = x2 + dx * expand;

        gsap.to(line, {
          attr: { x1: targetX1, x2: targetX2, strokeWidth: 4 },
          duration: 1.2,
          ease: 'power2.out',
          delay: idx * 0.05
        });
      }
    });
    
    // 垂直线：与斜线同样的"按比例加长"方式（围绕中点对称扩展）
    [verticalRef, verticalRef2].forEach((ref, idx) => {
      if (ref.current) {
        const line = ref.current;
        const y1 = parseFloat(line.getAttribute('y1')) || 0;
        const y2 = parseFloat(line.getAttribute('y2')) || 0;
        const dy = y2 - y1;
        const factor = 10; // 放大到原长度的3倍
        const expand = (factor - 1) / 2;
        let targetY1 = y1 - dy * expand;
        let targetY2 = y2 + dy * expand;

        gsap.to(line, {
          attr: { y1: targetY1, y2: targetY2, strokeWidth: 4 },
          duration: 1.2,
          ease: 'power2.out',
          delay: idx * 0.05
        });
      }
    });
  };

  // 暴露动画方法给父组件
  useImperativeHandle(ref, () => ({
    startAnimation: () => {
      animateLines();
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }
  }));

  return (
    <div className="shrink-0 w-[300px] h-[480px] overflow-visible">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 480"
        style={{ pointerEvents: 'none', display: 'block', overflow: 'visible' }}
      >
        <defs>
          {[
            '#750D5D',
            '#2BB856',
            '#198CE6',
            '#FF4136'
          ].map((color, idx) => (
            <linearGradient key={idx} id={`diagGrad${idx+1}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#092B4D" stopOpacity="0" />
              <stop offset="25%" stopColor={color} stopOpacity="1" />
              <stop offset="75%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor="#092B4D" stopOpacity="0" />
            </linearGradient>
          ))}
          {/* 激光发光滤镜（使用 userSpaceOnUse 以避免小 bbox 被裁剪） */}
          <filter id="laserGlow" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="4000" height="4000" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="g1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="g2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="g3" />
            <feMerge>
              <feMergeNode in="g3" />
              <feMergeNode in="g2" />
              <feMergeNode in="g1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="whiteHorz1" x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="whiteHorz2" x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="whiteVert1" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="whiteVert2" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[...Array(4)].map((_, i) => (
          <line
            key={`diagonal-${i}`}
            ref={(el) => (diagonalRefs.current[i] = el)}
            x1="60"
            y1={300 + i * 30}
            x2="260"
            y2={0 + i * 30}
            stroke={`url(#diagGrad${i+1})`}
            strokeWidth="4"
            opacity="1"
            filter="url(#laserGlow)"
          />
        ))}
      
        {/* 组成"4"的中横 */}
        <line
          ref={horizontalRef1}
          x1="80"
          y1="330"
          x2="280"
          y2="330.0001"
          stroke="url(#whiteHorz1)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="1"
          filter="url(#laserGlow)"
        />

        <line
          ref={horizontalRef2}
          x1="80"
          y1="360"
          x2="280"
          y2="360.0001"
          stroke="url(#whiteHorz2)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="1"
          filter="url(#laserGlow)"
        />

        {/* 组成"4"的右立柱 */}
        <line
          ref={verticalRef}
          x1="220"
          y1="90"
          x2="220.0001"
          y2="420"
          stroke="url(#whiteVert1)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="1"
          filter="url(#laserGlow)"
        />

        <line
          ref={verticalRef2}
          x1="250"
          y1="90"
          x2="250.0001"
          y2="420"
          stroke="url(#whiteVert2)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="1"
          filter="url(#laserGlow)"
        />
      </svg>
    </div>
  );
});

export default LineAnimation;
