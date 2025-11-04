"use client";

import React from "react";
import Link from "next/link";

const futureNames = {
  constraint: "Constraint",
  growth: "Growth",
  transform: "Transform",
  collapse: "Collapse"
};

// Donut Chart component
function DonutChart({ votes, totalParticipants, userVote }) {
  const calculateAngle = (percentage) => (percentage / 100) * 360;
  
  // Gap configuration
  const GAP_ANGLE = 8; // gap angle between slices (deg) — larger gap for readability
  const TOTAL_GAPS = votes.length; // number of gaps
  const GAP_SUM = TOTAL_GAPS * GAP_ANGLE; // total gap angle
  const AVAILABLE_ANGLE = 360 - GAP_SUM; // angle available for slices
  
  // Compute adjusted angle for each slice
  const getAdjustedAngle = (percentage) => {
    const totalPercentage = votes.reduce((sum, v) => sum + v.percentage, 0);
    return (AVAILABLE_ANGLE * percentage) / totalPercentage;
  };
  
  // Compute start angle with gaps
  const getStartAngle = (index) => {
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += getAdjustedAngle(votes[i].percentage) + GAP_ANGLE;
    }
    return startAngle;
  };

  // Compute the user vote marker position on the ring
  const getUserVotePosition = () => {
    if (!userVote) return null;
    
    const userResult = votes.find(v => v.id === userVote);
    if (!userResult) return null;
    
    const index = votes.findIndex(v => v.id === userVote);
    const startAngle = getStartAngle(index);
    const angle = getAdjustedAngle(userResult.percentage);
    const centerAngle = startAngle + angle / 2;
    
    // Compute coordinates of the ring center point (200x200 viewBox)
    const outerRadius = 85;
    const innerRadius = 72;
    const ringCenterRadius = (outerRadius + innerRadius) / 2; // 75
    
    const centerRad = (centerAngle - 90) * Math.PI / 180;
    const x_coord = 100 + ringCenterRadius * Math.cos(centerRad);
    const y_coord = 100 + ringCenterRadius * Math.sin(centerRad);
    
    // Convert to percentage coordinates
    const x = (x_coord / 200) * 100;
    const y = (y_coord / 200) * 100;
    
    return { x, y };
  };

  return (
    <div className="relative flex-1 flex justify-center lg:justify-end">
        <div className="relative" style={{ width: '500px', height: '500px', minWidth: '500px' }}>
          <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* Define gradient and glow for each slice */}
          <defs>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {votes.map((result, index) => {
              // Calculate slice center angle
              const startAngle = getStartAngle(index);
              const angle = getAdjustedAngle(result.percentage);
              const centerAngle = startAngle + angle / 2;
              
              // Compute center point on the outer ring
              const centerRad = (centerAngle - 90) * Math.PI / 180;
              const centerX = 100 + 85 * Math.cos(centerRad);
              const centerY = 100 + 85 * Math.sin(centerRad);
              
              return (
                <linearGradient
                  key={`gradient-${result.id}`}
                  id={`gradient-${result.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={centerX}
                  y1={centerY}
                  x2="100"
                  y2="100"
                >
                  <stop offset="0%" stopColor={result.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                </linearGradient>
              );
            })}
          </defs>
          
          {/* Render thin lines (arc to center, with gradient) */}
          {votes.map((result, index) => {
            const startAngle = getStartAngle(index);
            const angle = getAdjustedAngle(result.percentage);
            
            const outerRadius = 85;
            const innerRadius = 72; // 更细的环
            
            // Number of lines proportional to percentage (total up to 100)
            // e.g., 56% -> 56 lines
            const numPoints = Math.round(result.percentage);
            const points = [];
            
            for (let i = 0; i <= numPoints; i++) {
              const pointAngle = startAngle + (angle * i / numPoints);
              const pointRad = (pointAngle - 90) * Math.PI / 180;
              
              const outerX = 100 + outerRadius * Math.cos(pointRad);
              const outerY = 100 + outerRadius * Math.sin(pointRad);
              
              points.push({ x: outerX, y: outerY });
            }
            
            // Render curved lines using cubic Bézier
            return (
              <g key={`lines-${result.id}`}>
                {points.map((point, pointIdx) => {
                  const centerX = 100;
                  const centerY = 100;
                  
                  // 计算中点坐标
                  const midX = (point.x + centerX) / 2;
                  const midY = (point.y + centerY) / 2;
                  
                  // 计算从圆心到点的方向向量
                  const dx = point.x - centerX;
                  const dy = point.y - centerY;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  
                  // 计算垂直向量（顺时针方向）
                  const perpX = -dy / distance; // 负号实现顺时针
                  const perpY = dx / distance;
                  
                  // 控制点偏移量（扭曲程度）
                  const twistAmount = 24;
                  const controlX = midX + perpX * twistAmount;
                  const controlY = midY + perpY * twistAmount;
                  
                  return (
                    <path
                      key={pointIdx}
                      d={`M ${centerX} ${centerY} Q ${controlX} ${controlY} ${point.x} ${point.y}`}
                      fill="none"
                      stroke={`url(#gradient-${result.id})`}
                      strokeWidth="0.5"
                      strokeDasharray="200"
                      strokeDashoffset="200"
                      filter="url(#glow)"
                      style={{
                        animation: 'drawLine 3s ease-out forwards'
                      }}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* 绘制更细的 donut 圆环 */}
          {votes.map((result, index) => {
            const startAngle = getStartAngle(index);
            const angle = getAdjustedAngle(result.percentage);
            
            // 计算起始和结束的角度（弧度）
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (startAngle + angle - 90) * Math.PI / 180;
            
            const outerRadius = 85;
            const innerRadius = 82; // 更细的环
            
            // 外圆起始点和结束点
            const outerX1 = 100 + outerRadius * Math.cos(startRad);
            const outerY1 = 100 + outerRadius * Math.sin(startRad);
            const outerX2 = 100 + outerRadius * Math.cos(endRad);
            const outerY2 = 100 + outerRadius * Math.sin(endRad);
            
            // 内圆起始点和结束点
            const innerX1 = 100 + innerRadius * Math.cos(startRad);
            const innerY1 = 100 + innerRadius * Math.sin(startRad);
            const innerX2 = 100 + innerRadius * Math.cos(endRad);
            const innerY2 = 100 + innerRadius * Math.sin(endRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;

            // 绘制带间隙的 donut slice
            return (
              <path
                key={result.id}
                d={`M ${outerX1},${outerY1} 
                    A ${outerRadius},${outerRadius} 0 ${largeArcFlag},1 ${outerX2},${outerY2}
                    L ${innerX2},${innerY2}
                    A ${innerRadius},${innerRadius} 0 ${largeArcFlag},0 ${innerX1},${innerY1}
                    L ${outerX1},${outerY1}
                    Z`}
                fill={result.color}
                filter="url(#glow)"
              />
            );
          })}
        </svg>

        {/* 中心显示 Total Participants */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-sm text-white/60 mb-1">Total Participants</p>
            <p className="text-4xl md:text-5xl font-bold text-white">{totalParticipants.toLocaleString()}</p>
          </div>
        </div>

        {/* "You" Indicator on user's segment */}
        {userVote && (() => {
          const position = getUserVotePosition();
          if (!position) return null;
          return (
            <div 
              className="absolute pointer-events-none"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="bg-white text-black px-4 py-2 rounded-full font-semibold flex items-center gap-2 whitespace-nowrap">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                You
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Colors for categories (same as dashboard)
const COLORS = {
  constraint: "#C37EB3",
  growth: "#2BB856",
  transform: "#198CE6",
  collapse: "#FF4136",
};

// Donut row that mirrors booth-dashboard/QuestionSummary layout
function DonutRow({ category, count, total }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const iconMap = {
    constraint: "/images/constraint-logo.svg",
    growth: "/images/growth-logo.svg",
    transform: "/images/transform-logo.svg",
    collapse: "/images/collapse-logo.svg",
  };

  const labelMap = {
    constraint: "Constraint",
    growth: "Growth",
    transform: "Transform",
    collapse: "Collapse",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Donut (matches dashboard size/thickness) */}
      <div className="relative flex-shrink-0">
        <svg width="100" height="100" className="-rotate-90">
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke="white" strokeWidth="2.0" opacity="0.2" />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={COLORS[category]}
            strokeWidth="2.0"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center icon (no inner bg, same as dashboard) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={iconMap[category]} alt={labelMap[category]} className="w-10 h-10" />
        </div>
      </div>

      {/* Text info (matches dashboard typography) */}
      <div>
        <div className="text-white mb-1 text-[16px]">{labelMap[category]}</div>
        <div className="flex items-baseline gap-3">
          <div className="text-white text-3xl font-bold">{Math.round(percentage)}%</div>
          <div className="text-white text-[16px] opacity-70">{count.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

// Compact donut used inside statistic cards
function CompactDonut({ id, color, percentage }) {
  const size = 96;
  const r = 40;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(100, percentage)) / 100 * circ;
  const offset = circ - dash;
  return (
    <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeOpacity={0.15} strokeWidth={6} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[64px] h-[64px] rounded-full bg-black/70 border border-white/10 flex items-center justify-center">
          <img src={`/images/${id}-logo.svg`} alt={id} className="w-8 h-8 opacity-90" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ id, label, color, percentage, count }) {
  return (
    <div className="flex items-center justify-between bg-white/10 p-6 border border-white/10">
      <div className="flex items-center gap-6">
        <CompactDonut id={id} color={color} percentage={percentage} />
        <div>
          <div className="text-white text-lg mb-1">{label}</div>
          <div className="text-white text-6xl font-light leading-none">{percentage}%</div>
        </div>
      </div>
      <div className="text-white text-2xl opacity-90 ml-6">
        {count.toLocaleString()}
      </div>
    </div>
  );
}

export default function ResultsSummarySection({ counts, totalParticipants = 0, userVote = null }) {
  const votes = [
    { id: 'constraint', percentage: totalParticipants > 0 ? Math.round((counts?.constraint || 0) / totalParticipants * 100) : 0, color: '#C37EB3' },
    { id: 'growth', percentage: totalParticipants > 0 ? Math.round((counts?.growth || 0) / totalParticipants * 100) : 0, color: '#2BB856' },
    { id: 'transform', percentage: totalParticipants > 0 ? Math.round((counts?.transform || 0) / totalParticipants * 100) : 0, color: '#198CE6' },
    { id: 'collapse', percentage: totalParticipants > 0 ? Math.round((counts?.collapse || 0) / totalParticipants * 100) : 0, color: '#FF4136' },
  ];

  const mainFuture = votes.reduce((max, current) => current.percentage > max.percentage ? current : max);
  const userVoteResult = userVote ? votes.find(v => v.id === userVote) : null;
  const matchingCount = userVoteResult ? Math.round((userVoteResult.percentage / 100) * totalParticipants) : 0;

  return (
    <>
      <style>{`
        @keyframes drawLine {
          from {
            stroke-dashoffset: 200;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <div className="min-h-screen px-16 pt-[100px]">
        <div className="flex flex-col gap-12">
        
        {/* Two-column section */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left column: Title + line */}
          <div className="relative flex-1 lg:order-1">
            <div className="flex items-end gap-4">
              <div>
                <h1
                  className="text-5xl md:text-[80px] tracking-[-0.05em] font-light leading-tight"
                  style={{
                    background: 'linear-gradient(to right, white, #FCF5B9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Thanks for voting.
                </h1>
              </div>
              <div className="flex-1 mb-6 h-[1px] bg-white/20"></div>
            </div>
          </div>

          {/* Right - Result Summary (English) */}
          <div className="flex-1 max-w-[640px] space-y-8 lg:order-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-normal text-white">
                Result Summary
              </h2>
              <p className="text-xl text-white/80">
                {userVoteResult && (
                  <>
                    Your choice is{' '}
                    <span className="font-bold" style={{ color: userVoteResult.color }}>
                      {futureNames[userVoteResult.id]}
                    </span>
                    .{' '}
                  </>
                )}
                {userVoteResult && (
                  <>
                    {matchingCount.toLocaleString()} participants ({userVoteResult.percentage}%) chose the same.
                  </>
                )}
                {' '}The most selected option is{' '}
                <span className="font-bold text-white">
                  {futureNames[mainFuture.id]}
                </span>
                .
              </p>
            </div>

            {/* Big card containing Total Participants and four charts (dashboard style, 2 columns) */}
            <div className="relative bg-white/10 outline outline-1 outline-white/20 p-6 md:p-6">
              {/* top-left corner decorations */}
              <div className="absolute left-0 top-0 w-4 h-1 bg-white/50"></div>
              <div className="absolute left-0 top-0 w-1 h-4 bg-white/50"></div>
              {/* Total Participants block */}
              <div className="flex justify-between items-center mb-8">
                <div className="text-white text-[24px]">Total Participants</div>
                <div className="text-white text-[36px] font-normal leading-none">
                  {totalParticipants.toLocaleString()}
                </div>
              </div>

              {/* Four donut rows inside one card (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-16">
                <DonutRow category="constraint" count={counts?.constraint || 0} total={totalParticipants} />
                <DonutRow category="growth" count={counts?.growth || 0} total={totalParticipants} />
                <DonutRow category="transform" count={counts?.transform || 0} total={totalParticipants} />
                <DonutRow category="collapse" count={counts?.collapse || 0} total={totalParticipants} />
              </div>
            </div>

            {/* Next Chapter button */}
            <Link 
              href="/futures"
              aria-disabled
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              tabIndex={-1}
              className="group relative w-[320px] h-[120px] p-[24px] flex-col items-start justify-start bg-white cursor-default block pointer-events-none opacity-90"
            >
              <div className="font-light text-[16px] text-black/60">Next Chapter</div>
              <div className="font-light text-[24px] text-black">Is Your Org Ready?</div>
              <div className="absolute right-[24px] bottom-[24px] w-[64px] h-[64px] flex items-center justify-center">
                <img src="/images/next_right.svg" className="w-full h-full object-cover transition-transform duration-300 group-hover:translate-x-1"/>
              </div>
            </Link>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

