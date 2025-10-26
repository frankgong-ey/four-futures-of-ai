"use client";

import React, { useState } from "react";

// 版本数据
const versions = [
  {
    id: "all-industries",
    name: "All Industries",
    icon: "🌐",
  },
  {
    id: "consumer-products",
    name: "Consumer Product",
    icon: "🛒",
  },
  {
    id: "industrial-products",
    name: "Industrial Product",
    icon: "📦",
  },
  {
    id: "oil-gas",
    name: "Oil & Gas",
    icon: "🛢️",
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: "⚡",
  },
  {
    id: "tech",
    name: "Technology",
    icon: "🌍",
  },
  {
    id: "finance",
    name: "Finance",
    icon: "🏦",
  },
  {
    id: "government",
    name: "Government",
    icon: "🏛️",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "📊",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "🧬",
  },
];

export default function HeroSection({ onVersionSelect }) {
  const [selectedVersion, setSelectedVersion] = useState(null);

  const handleVersionClick = (versionId) => {
    setSelectedVersion(versionId);
    if (onVersionSelect) {
      onVersionSelect(versionId);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-transparent flex items-center">
      {/* 内容容器 */}
      <div className="w-full px-16 flex gap-8">
        {/* 左侧标题区域 */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-sm text-white/70 mb-4">Four Futures of AI</div>
          <h1 className="text-7xl font-bold text-white leading-none">
            Choose a version
            <br />
            to explore
          </h1>
        </div>

        {/* 右侧版本选择面板 */}
        <div className="flex-[1.5] flex flex-col justify-center">
          <div className="text-white mb-6">I would like to explore for:</div>
          
          <div className="border border-white/30 bg-black/50 backdrop-blur-sm p-6">
            {/* All Industries 选项 - 单独一行 */}
            <button
              onClick={() => handleVersionClick("all-industries")}
              className={`w-full h-[120px] p-6 mb-4 border transition-all ${
                selectedVersion === "all-industries"
                  ? "border-white bg-white/10"
                  : "border-white/30 hover:border-white/50 bg-transparent"
              }`}
            >
              <div className="flex items-center justify-center">
                <div className="text-4xl mb-2">🌐</div>
              </div>
              <div className="text-white text-lg font-medium">All Industries</div>
            </button>

            {/* 行业特定选项 - 3x3 网格 */}
            <div className="grid grid-cols-3 gap-px bg-white/30 overflow-hidden">
              {versions.slice(1, 10).map((version, index) => (
                <button
                  key={version.id}
                  onClick={() => handleVersionClick(version.id)}
                  className={`h-[120px] p-4 transition-all ${
                    selectedVersion === version.id
                      ? "border-2 border-white bg-white/10"
                      : "bg-black/50 hover:bg-black/70"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-3xl mb-2">{version.icon}</div>
                    <div className="text-white text-xs text-center leading-tight">
                      {version.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
