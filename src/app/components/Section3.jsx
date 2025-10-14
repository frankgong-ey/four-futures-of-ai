'use client';

import { forwardRef, useRef, useState, useEffect } from 'react';

// AI准确性图表组件
function AIAccuracyChart() {
  const chartRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const currentElement = chartRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  // 图表数据
  const dataPoints = [
    { x: 0.15, y: 3.5, label: null },
    { x: 0.35, y: 8.5, label: null },
    { x: 0.55, y: 6.5, label: "Chat GPT" },
    { x: 0.75, y: 13.5, label: "Chat GPT" },
    { x: 0.85, y: 5.5, label: null },
    { x: 0.87, y: 15.5, label: null },
    { x: 0.95, y: 9, label: null },
    { x: 0.98, y: 17.5, label: null },
  ];

  // 时间标签
  const timeLabels = [
    "May, 24", "Jul, 24", "Sep, 24", "Nov, 24", 
    "Jan, 25", "Mar, 25", "May, 25"
  ];

  // 准确度标签
  const accuracyLabels = [
    "0.0", "2.5", "5.0", "7.5", "10.0", 
    "12.5", "15.0", "17.5", "20.0"
  ];

  const chartWidth = 1000;
  const chartHeight = 500;
  const margin = { top: 60, right: 80, bottom: 80, left: 80 };

  return (
    <div ref={chartRef} className="w-full">
      {/* 标题 */}
      <div className="mb-8">
        <h3 className="text-white text-sm opacity-80 mb-2">
          AI's Accuracy on Humanity's Last Exam
        </h3>
        <h2 
          className="text-white font-light text-2xl"
          style={{ fontSize: "clamp(24px, 4vw, 32px)" }}
        >
          And AI performance has improved exponentially.
        </h2>
      </div>

      {/* SVG图表 */}
      <div 
        className="w-full rounded-lg overflow-hidden" 
        style={{ 
          aspectRatio: '2/1',
          background: 'rgba(6, 7, 11, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ background: 'transparent' }}
        >
          {/* 定义发光效果 */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="pointGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* 网格线 */}
          {accuracyLabels.map((_, i) => {
            const y = margin.top + (i * (chartHeight - margin.top - margin.bottom) / 8);
            return (
              <line
                key={`grid-y-${i}`}
                x1={margin.left}
                y1={y}
                x2={chartWidth - margin.right}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* X轴 */}
          <line
            x1={margin.left}
            y1={chartHeight - margin.bottom}
            x2={chartWidth - margin.right}
            y2={chartHeight - margin.bottom}
            stroke="white"
            strokeWidth="1"
          />

          {/* Y轴 */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={chartHeight - margin.bottom}
            stroke="white"
            strokeWidth="1"
          />

          {/* X轴标签 */}
          {timeLabels.map((label, i) => {
            const x = margin.left + (i * (chartWidth - margin.left - margin.right) / 6);
            return (
              <text
                key={`x-label-${i}`}
                x={x}
                y={chartHeight - margin.bottom + 25}
                fill="white"
                fontSize="12"
                textAnchor="middle"
                className="opacity-80"
              >
                {label}
              </text>
            );
          })}

          {/* Y轴标签 */}
          {accuracyLabels.map((label, i) => {
            const y = chartHeight - margin.bottom - (i * (chartHeight - margin.top - margin.bottom) / 8);
            return (
              <g key={`y-label-${i}`}>
                <text
                  x={margin.left - 15}
                  y={y + 4}
                  fill="white"
                  fontSize="12"
                  textAnchor="end"
                  className="opacity-80"
                >
                  {label}
                </text>
                {/* Y轴标题 */}
                {i === 4 && (
                  <text
                    x={15}
                    y={chartHeight / 2}
                    fill="white"
                    fontSize="12"
                    textAnchor="middle"
                    className="opacity-80"
                    transform={`rotate(-90, 15, ${chartHeight / 2})`}
                  >
                    Accuracy (%)
                  </text>
                )}
              </g>
            );
          })}

          {/* 趋势线 */}
          <path
            d={`M ${margin.left + dataPoints[0].x * (chartWidth - margin.left - margin.right)} ${
              chartHeight - margin.bottom - (dataPoints[0].y / 20) * (chartHeight - margin.top - margin.bottom)
            } Q ${margin.left + dataPoints[3].x * (chartWidth - margin.left - margin.right)} ${
              chartHeight - margin.bottom - (dataPoints[3].y / 20) * (chartHeight - margin.top - margin.bottom)
            } ${margin.left + dataPoints[7].x * (chartWidth - margin.left - margin.right)} ${
              chartHeight - margin.bottom - (dataPoints[7].y / 20) * (chartHeight - margin.top - margin.bottom)
            }`}
            fill="none"
            stroke="white"
            strokeWidth="3"
            filter="url(#glow)"
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{
              strokeDasharray: isVisible ? 'none' : '1000',
              strokeDashoffset: isVisible ? '0' : '1000',
              transition: 'stroke-dashoffset 2s ease-out, opacity 0.5s ease-out'
            }}
          />

          {/* 数据点 */}
          {dataPoints.map((point, i) => {
            const x = margin.left + point.x * (chartWidth - margin.left - margin.right);
            const y = chartHeight - margin.bottom - (point.y / 20) * (chartHeight - margin.top - margin.bottom);
            
            return (
              <g key={`point-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="white"
                  filter="url(#pointGlow)"
                  className={`transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                />
                
                {/* 标签 */}
                {point.label && (
                  <text
                    x={x}
                    y={y - 15}
                    fill="white"
                    fontSize="10"
                    textAnchor="middle"
                    className={`opacity-90 transition-all duration-500 ${isVisible ? 'opacity-90' : 'opacity-0'}`}
                    style={{ transitionDelay: `${i * 100 + 300}ms` }}
                  >
                    {point.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const Section3 = forwardRef(function Section3({ onRefsReady }, ref) {
  const chartRef = useRef(null);
  const chartBlurOverlayRef = useRef(null);
  
  // 当refs准备好后，通知父组件
  useEffect(() => {
    if (onRefsReady && chartRef.current && chartBlurOverlayRef.current) {
      onRefsReady(chartRef, chartBlurOverlayRef);
    }
  }, [onRefsReady]);
  
  return (
    <>
      <section 
        ref={ref}
        className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center text-white pointer-events-none"
        style={{ 
          padding: '64px 24px', 
          opacity: 0, 
          zIndex: 10
        }}
      >
        <div ref={chartRef} className="w-full max-w-[1200px] pointer-events-auto" style={{ position: 'relative', zIndex: 1 }}>
          <AIAccuracyChart />
        </div>
      </section>
      
      {/* 图表模糊遮罩 */}
      <div
        ref={chartBlurOverlayRef}
        className="fixed pointer-events-none"
        style={{
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 5,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          background: 'rgba(0,0,0,0.001)',
          opacity: 0,
          display: 'none'
        }}
      />
    </>
  );
});

export default Section3;
