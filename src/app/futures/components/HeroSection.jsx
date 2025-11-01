"use client";

import React, { useState } from "react";
import Image from "next/image";

// 版本数据
const versions = [
  {
    id: "all-industries",
    name: "All Industries",
    iconSrc: null,
  },
  {
    id: "consumer-products",
    name: "Consumer Products",
    iconSrc: "/images/industry/consumer-products.svg",
  },
  {
    id: "industrial-products",
    name: "Industrial Products",
    iconSrc: "/images/industry/industrial-products.svg",
  },
  {
    id: "oil-gas",
    name: "Oil & Gas",
    iconSrc: "/images/industry/oil-gas.svg",
  },
  {
    id: "defense",
    name: "Defense",
    iconSrc: "/images/industry/defense.svg",
  },
  {
    id: "banking-capital-markets",
    name: "Banking & Capital Markets",
    iconSrc: "/images/industry/banking.svg",
  },
  {
    id: "retail",
    name: "Retail",
    iconSrc: "/images/industry/retail.svg",
  },
  {
    id: "life-sciences",
    name: "Life Sciences",
    iconSrc: "/images/industry/life-sciences.svg",
  },
];

export default function HeroSection({ onVersionSelect }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [hoveredVersion, setHoveredVersion] = useState(null);

  const handleVersionClick = (versionId) => {
    setSelectedVersion(versionId);
    if (onVersionSelect) {
      onVersionSelect(versionId);
    }
  };

  const getHoverBgSrc = (versionId) => {
    const bgMap = {
      'consumer-products': '/images/industry/consumer-products-bg.jpg',
    };
    return bgMap[versionId];
  };

  const hoverBgSrc = hoveredVersion ? getHoverBgSrc(hoveredVersion) : null;

  return (
    <div className="relative w-full min-h-screen bg-black flex items-center" data-hero-section>
      {/* 默认渐变背景 */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/hero_gradient.svg)',
          opacity: 1
        }}
      />
      
      {/* Hover 背景图片 - Consumer Products */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: 'url(/images/industry/consumer-products-bg.jpg)',
          opacity: hoveredVersion === 'consumer-products' ? 0.6 : 0,
          pointerEvents: 'none'
        }}
      />
      
      {/* 内容容器 */}
      <div className="relative z-10 w-full px-16 flex gap-8">
        {/* 左侧标题区域 */}
        <div className="flex-1 flex flex-col justify-start max-w-[640px]">
          <div className="text-[24px] font-bold text-white/60 mb-4">Four Futures of AI</div>
          <h1 className="text-[96px] font-light text-white leading-none">
            Choose your industry to explore
          </h1>
        </div>

        {/* 右侧版本选择面板 */}
        <div className="flex-[1.5] flex flex-col justify-start max-w-[800px]">
          <div className="tetx-[24px] font-bold text-white mb-4">I would like to explore for:</div>
          
          <div className="p-0">
            {/* All Industries 选项 - 单独一行 */}
            <button
              onClick={() => handleVersionClick("all-industries")}
              className="w-full h-[120px] p-6 mb-4 border border-white/10 bg-white/10 backdrop-blur-[16px] hover:border-white/50 hover:bg-white/20 transition-all duration-300 cursor-pointer"
            >
              <div className="text-white text-[18px] font-medium">All Industries</div>
            </button>

            {/* 行业特定选项 - 3x3 网格 */}
            <div className="grid grid-cols-3 border border-white/10 bg-white/10 backdrop-blur-[16px] overflow-hidden">
              {versions.slice(1, 10).map((version, index) => (
                <button
                  key={version.id}
                  onClick={() => handleVersionClick(version.id)}
                  onMouseEnter={() => setHoveredVersion(version.id)}
                  onMouseLeave={() => setHoveredVersion(null)}
                  className="h-[160px] p-2 m-2 border border-transparent hover:border-white/50 hover:bg-white/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {version.iconSrc && (
                      <div className="mb-4 w-8 h-8 relative">
                        <Image src={version.iconSrc} alt={version.name} fill className="object-contain" />
                      </div>
                    )}
                    <div className="text-white text-[18px] text-center font-medium">
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
