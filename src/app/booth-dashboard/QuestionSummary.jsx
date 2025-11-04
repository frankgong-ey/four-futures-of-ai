"use client";

import React from "react";
import Image from "next/image";

const COLORS = {
  constraint: "#C37EB3",
  growth: "#2BB856",
  transform: "#198CE6",
  collapse: "#FF4136",
};

function DonutChart({ category, count, total }) {
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
      {/* Donut Chart */}
      <div className="relative flex-shrink-0">
        <svg width="100" height="100" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth="2.0"
            opacity="0.2"
          />
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
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={iconMap[category]}
            alt={labelMap[category]}
            width={40}
            height={40}
          />
        </div>
      </div>

      {/* Text info */}
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

export default function QuestionSummary({ counts }) {
  const total = counts.constraint + counts.growth + counts.transform + counts.collapse;

  return (
    <div className="min-h-screen px-[64px] py-20 pt-[120px]">
      <div className="grid grid-cols-12 gap-[24px]">
        {/* Left side - Title */}
        <div className="col-span-5 col-start-1">
          <div className="mb-4">
            <p className="text-[20px] text-[#FFE600] mb-2">Polling Question</p>
          </div>
          <div>
            <h1 
              className="text-5xl md:text-[64px] font-light"
              style={{
                background: 'linear-gradient(to right, white, #FCF5B9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Which future do you think we're heading towards?
            </h1>
          </div>
        </div>

        {/* Right side - Donut Charts */}
        <div className="col-span-2 col-start-11 flex flex-col gap-4 border-t-[4px] border-white ">
          <div className="pt-4 mb-4">
            <div className="text-white mb-2">Total Participants</div>
            <div className="text-white text-6xl font-bold">{total.toLocaleString()}</div>
          </div>
          <DonutChart category="constraint" count={counts.constraint} total={total} />
          <DonutChart category="growth" count={counts.growth} total={total} />
          <DonutChart category="transform" count={counts.transform} total={total} />
          <DonutChart category="collapse" count={counts.collapse} total={total} />
        </div>
      </div>
    </div>
  );
}

