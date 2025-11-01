"use client";

import React from "react";

const futureNames = {
  constraint: "Constraint",
  growth: "Growth",
  transform: "Transform",
  collapse: "Collapse"
};

// Donut Chart 组件
function DonutChart({ votes, totalParticipants, userVote }) {
  const calculateAngle = (percentage) => (percentage / 100) * 360;
  
  // 间隙设置
  const GAP_ANGLE = 8; // slice 之间的间隙角度（度）- 增加间隙使其更明显
  const TOTAL_GAPS = votes.length; // 间隙数量
  const GAP_SUM = TOTAL_GAPS * GAP_ANGLE; // 总间隙角度
  const AVAILABLE_ANGLE = 360 - GAP_SUM; // 可用于 slice 的总角度
  
  // 计算调整后的角度
  const getAdjustedAngle = (percentage) => {
    const totalPercentage = votes.reduce((sum, v) => sum + v.percentage, 0);
    return (AVAILABLE_ANGLE * percentage) / totalPercentage;
  };
  
  // 计算起始角度（带间隙）
  const getStartAngle = (index) => {
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += getAdjustedAngle(votes[i].percentage) + GAP_ANGLE;
    }
    return startAngle;
  };

  // 计算用户投票在图表中的位置
  const getUserVotePosition = () => {
    if (!userVote) return null;
    
    const userResult = votes.find(v => v.id === userVote);
    if (!userResult) return null;
    
    const index = votes.findIndex(v => v.id === userVote);
    const startAngle = getStartAngle(index);
    const angle = getAdjustedAngle(userResult.percentage);
    const centerAngle = startAngle + angle / 2;
    
    // 计算 donut 环中心点的坐标（200x200 坐标系）
    const outerRadius = 85;
    const innerRadius = 72;
    const ringCenterRadius = (outerRadius + innerRadius) / 2; // 75
    
    const centerRad = (centerAngle - 90) * Math.PI / 180;
    const x_coord = 100 + ringCenterRadius * Math.cos(centerRad);
    const y_coord = 100 + ringCenterRadius * Math.sin(centerRad);
    
    // 转换为百分比坐标
    const x = (x_coord / 200) * 100;
    const y = (y_coord / 200) * 100;
    
    return { x, y };
  };

  return (
    <div className="relative flex-1 flex justify-center lg:justify-end">
        <div className="relative" style={{ width: '500px', height: '500px', minWidth: '500px' }}>
          <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* 定义每个 slice 的渐变和发光效果 */}
          <defs>
            {/* Glow 滤镜 */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {votes.map((result, index) => {
              // 计算该 slice 的中心角
              const startAngle = getStartAngle(index);
              const angle = getAdjustedAngle(result.percentage);
              const centerAngle = startAngle + angle / 2;
              
              // 计算中心点在外圈的位置
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
          
          {/* 绘制细线（从圆弧向圆心，带渐变效果） */}
          {votes.map((result, index) => {
            const startAngle = getStartAngle(index);
            const angle = getAdjustedAngle(result.percentage);
            
            const outerRadius = 85;
            const innerRadius = 72; // 更细的环
            
            // 根据 slice 的百分比分配线数（总共 100 根）
            // 例如：56% 的 slice 会有 56 根线
            const numPoints = Math.round(result.percentage);
            const points = [];
            
            for (let i = 0; i <= numPoints; i++) {
              const pointAngle = startAngle + (angle * i / numPoints);
              const pointRad = (pointAngle - 90) * Math.PI / 180;
              
              const outerX = 100 + outerRadius * Math.cos(pointRad);
              const outerY = 100 + outerRadius * Math.sin(pointRad);
              
              points.push({ x: outerX, y: outerY });
            }
            
            // 绘制扭曲的线条（使用贝塞尔曲线）
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

export default function ResultsSummarySection({ results }) {
  if (!results) return null;
  
  const { totalParticipants, userVote, sinceDate, results: votes } = results;
  
  // 计算主要未来
  const mainFuture = votes.reduce((max, current) => 
    current.percentage > max.percentage ? current : max
  );

  // 生成 interpretation 文字
  const getInterpretation = (percentage) => {
    if (percentage < 10) {
      return "a unique vision that stands out.";
    } else if (percentage < 25) {
      return "an emerging vision with growing resonance.";
    } else if (percentage < 40) {
      return "a well-supported perspective among participants.";
    } else if (percentage < 50) {
      return "a perspective shared by a thoughtful few.";
    } else {
      return "a shared vision embraced by the majority.";
    }
  };

  // 获取用户投票的信息
  const userVoteResult = userVote ? votes.find(v => v.id === userVote) : null;

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
      <div className="min-h-screen px-6 py-20 pt-[160px]">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* First Section: Title and Timestamp */}
        <div className="flex justify-between items-start">
          {/* Title */}
          <div>
            <h1 className="text-5xl md:text-[64px] font-bold text-white mb-4">
              Here're our polling results
            </h1>
          </div>

          {/* Timestamp */}
          <div className="text-right">
            <p className="text-lg font-semibold text-white mb-2">All Time Results</p>
            <p className="text-sm text-white/60">Since {sinceDate}</p>
          </div>
        </div>

        {/* Second Section: Left (Results Interpretation) and Right (Donut Chart) */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Side - Results Interpretation */}
          <div className="flex-1 space-y-8">
            {/* Summary Text */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Summary
              </h2>
              
              {/* First Paragraph */}
              <p className="text-xl text-white/80">
                The majority of participants are preparing for the <span style={{ color: mainFuture.color }} className="font-bold">{futureNames[mainFuture.id]}</span> future.
              </p>
              
              {/* Second Paragraph */}
              {userVoteResult ? (
                <p className="text-lg text-white/80 leading-relaxed">
                  You selected <span style={{ color: userVoteResult.color, fontWeight: 'bold' }}>
                    {futureNames[userVoteResult.id].toUpperCase()}
                  </span>, a perspective shared by{' '}
                  <span style={{ color: userVoteResult.color, fontWeight: 'bold' }}>
                    {userVoteResult.percentage}%
                  </span> of all participants – {getInterpretation(userVoteResult.percentage)}
                </p>
              ) : (
                <p className="text-lg text-white/80 leading-relaxed">
                  {`${votes[0].percentage}% of participants are preparing for the ${futureNames[votes[0].id]} future, while ${votes[1].percentage}% expect the ${futureNames[votes[1].id]} scenario. The ${futureNames[votes[2].id]} future represents ${votes[2].percentage}% of votes, and ${futureNames[votes[3].id]} rounds out the responses at ${votes[3].percentage}%.`}
                </p>
              )}
            </div>

            {/* Four Result Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {votes.map((result) => (
                <div
                  key={result.id}
                  className="bg-black p-6 border border-white/10"
                >
                  {/* Top colored line */}
                  <div 
                    className="h-1 mb-6 rounded"
                    style={{ 
                      background: `linear-gradient(to right, ${result.color} 0%, ${result.color}AA 100%)` 
                    }}
                  />
                  
                  {/* Icon and Label */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Icon placeholder - 50% white color block */}
                    <div 
                      className="w-8 h-8 bg-white/50 rounded"
                      style={{ width: '24px', height: '24px' }}
                    />
                    <div className="text-lg font-semibold text-white">
                      {futureNames[result.id]}
                    </div>
                  </div>
                  
                  {/* Percentage */}
                  <div className="text-5xl font-bold text-white">
                    {result.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* 右侧占位（已将 3D Canvas 移至 results/page.jsx 背景层） */}
        <div className="relative flex-1 flex justify-center lg:justify-end" />
        </div>
      </div>
    </div>
    </>
  );
}

