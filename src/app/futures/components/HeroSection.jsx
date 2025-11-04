"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { loadVersionSettings } from "../../../components/Settings";

// Version options
const allVersions = [
  {
    id: "all-industries",
    name: "All Industries",
    iconSrc: null,
    bgSrc: null,
  },
  {
    id: "consumer-products",
    name: "Consumer Products",
    iconSrc: "/images/industry/consumer-products.svg",
    bgSrc: "/images/industry/consumer-products-bg.jpg",
  },
  {
    id: "industrial-products",
    name: "Industrial Products",
    iconSrc: "/images/industry/industrial-products.svg",
    bgSrc: "/images/industry/industrial-products-bg.jpg",
  },
  {
    id: "oil-gas",
    name: "Oil & Gas",
    iconSrc: "/images/industry/oil-gas.svg",
    bgSrc: "/images/industry/oil-gas-bg.jpg",
  },
  {
    id: "defense",
    name: "Defense",
    iconSrc: "/images/industry/defense.svg",
    bgSrc: "/images/industry/defense-bg.jpg",
  },
  {
    id: "banking-capital-markets",
    name: "Banking & Capital Markets",
    iconSrc: "/images/industry/banking.svg",
    bgSrc: "/images/industry/banking-bg.jpg",
  },
  {
    id: "retail",
    name: "Retail",
    iconSrc: "/images/industry/retail.svg",
    bgSrc: "/images/industry/retail-bg.jpg",
  },
  {
    id: "life-sciences",
    name: "Life Sciences",
    iconSrc: "/images/industry/life-sciences.svg",
    bgSrc: "/images/industry/life-sciences-bg.jpg",
  },
];

export default function HeroSection({ onVersionSelect }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [versions, setVersions] = useState(allVersions);

  // Load enabled versions from localStorage
  useEffect(() => {
    const loadVersions = () => {
      const enabledSettings = loadVersionSettings();
      const filteredVersions = allVersions.filter(
        (version) => enabledSettings[version.id] === true
      );
      setVersions(filteredVersions);
    };

    // Load on mount
    loadVersions();

    // Listen for settings changes
    const handleSettingsChange = () => {
      loadVersions();
    };

    window.addEventListener("versionSettingsChanged", handleSettingsChange);

    return () => {
      window.removeEventListener("versionSettingsChanged", handleSettingsChange);
    };
  }, []);

  // Trigger fade-in on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  // Preload background image
  useEffect(() => {
    const img = document.createElement('img');
    img.src = '/images/hero_gradient.svg';
    img.onload = () => setBgLoaded(true);
  }, []);

  const handleVersionClick = (versionId) => {
    setSelectedVersion(versionId);
    if (onVersionSelect) {
      onVersionSelect(versionId);
    }
  };

  return (
    <div className="relative w-full min-h-screen pt-[120px] bg-black flex items-start" data-hero-section>
      {/* Default gradient background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: 'url(/images/hero_gradient.svg)',
          opacity: bgLoaded ? 1 : 0
        }}
      />
      
      {/* Content container */}
      <div 
        className="relative z-10 w-full px-16 flex gap-8 transition-opacity duration-1000"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        {/* Left title area */}
        <div className="flex-1 flex flex-col justify-start max-w-[640px]">
          <div className="text-[24px] font-normal tracking-[-0.05em] text-white/60 mb-4">Four Futures of AI</div>
          <h1 className="text-[80px] font-light text-white leading-none">
            Choose your industry to explore
          </h1>
        </div>

        {/* Right version selector panel */}
        <div className="flex-[1.5] flex flex-col justify-start max-w-[800px]">
          <div className="tetx-[24px] font-bold text-white mb-4">I would like to explore for:</div>
          
          <div className="p-0">
            {/* All Industries option - full width row (only if enabled) */}
            {versions[0]?.id === "all-industries" && (
              <button
                onClick={() => handleVersionClick("all-industries")}
                className="w-full h-[120px] p-6 mb-4 border border-white/10 bg-white/10 backdrop-blur-[16px] hover:border-white/50 hover:bg-white/20 transition-all duration-300 cursor-pointer"
              >
                <div className="text-white text-[18px] font-medium">All Industries</div>
              </button>
            )}

            {/* Industry-specific options - 3x3 grid */}
            {versions.filter(v => v.id !== "all-industries").length > 0 && (
              <div className="grid grid-cols-3 border border-white/10 bg-white/10 backdrop-blur-[16px] overflow-hidden">
                {versions.filter(v => v.id !== "all-industries").map((version, index) => (
                <button
                  key={version.id}
                  onClick={() => handleVersionClick(version.id)}
                  className="relative h-[160px] p-2 border border-transparent hover:border-white/50 hover:bg-white/20 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Background image layer */}
                  {version.bgSrc && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${version.bgSrc})`,
                        opacity: 0.4,
                        zIndex: 0
                      }}
                    />
                  )}
                  
                  {/* 内容层 */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
