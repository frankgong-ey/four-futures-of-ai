"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FuturesOverview from "./components/FuturesOverview";
import HeroSection from "./components/HeroSection";
import DetailView from "./components/DetailView";
// 导入所有 detailData
import { detailData } from "./data/detailData.js";
import { ScrollSectionContext } from "../../components/Global3DCanvas";

// 从 detailData 生成版本数据
const generateVersionData = (versionId, versionName, futureIds) => ({
  id: versionId,
  name: versionName,
  futures: futureIds
    .map(id => {
      const data = detailData[id];
      if (data) {
        return {
          id: data.id,
          title: data.title,
          description: data.description,
          color: data.color
        };
      }
      return null;
    })
    .filter(Boolean)
});

const versionsData = {
  "all-industries": generateVersionData("all-industries", "All Industries", [
    "constraint", "growth", "transform", "collapse"
  ]),
  "consumer-products": generateVersionData("consumer-products", "Consumer Products", [
    "constraint-cp", "growth-cp", "transform-cp", "collapse-cp"
  ]),
  "industrial-products": generateVersionData("industrial-products", "Industrial Products", [
    "constraint-ip", "growth-ip", "transform-ip", "collapse-ip"
  ]),
  "oil-gas": generateVersionData("oil-gas", "Oil & Gas", [
    "constraint-og", "growth-og", "transform-og", "collapse-og"
  ]),
  "defense": generateVersionData("defense", "Defense", [
    "constraint-d", "growth-d", "transform-d", "collapse-d"
  ]),
  "banking-capital-markets": generateVersionData("banking-capital-markets", "Banking & Capital Markets", [
    "constraint-bcm", "growth-bcm", "transform-bcm", "collapse-bcm"
  ]),
  "retail": generateVersionData("retail", "Retail", [
    "constraint-r", "growth-r", "transform-r", "collapse-r"
  ]),
  "life-sciences": generateVersionData("life-sciences", "Life Sciences", [
    "constraint-ls", "growth-ls", "transform-ls", "collapse-ls"
  ])
};

export default function FuturesPage() {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedFuture, setSelectedFuture] = useState(null);
  const router = useRouter();
  const { setCurrentSection } = useContext(ScrollSectionContext) || {};

  const currentVersion = selectedVersion ? versionsData[selectedVersion] : null;

  // 进入 /futures 页面时重置 3D 相机到初始（hero）
  useEffect(() => {
    if (typeof setCurrentSection === 'function') {
      setCurrentSection(null); // Global3DCanvas 会将 null 映射为 hero
    }
  }, []);

  // 检查 URL 参数和 hash
  useEffect(() => {
    // 从 URL 查询参数中获取版本
    const urlParams = new URLSearchParams(window.location.search);
    const versionParam = urlParams.get('version');
    
    // 从 URL hash 中获取 futureId
    const hash = window.location.hash.replace('#', '');
    
    if (versionParam && !selectedVersion) {
      // 如果有版本参数，使用它
      setSelectedVersion(versionParam);
    } else if (hash && !selectedVersion) {
      // 如果有 hash 但没有版本参数，默认选择 "all-industries"
      setSelectedVersion('all-industries');
    }
  }, [selectedVersion]);

  const handleVersionChange = (versionId) => {
    setSelectedVersion(versionId);
  };

  const handleFutureClick = (futureId) => {
    const futureData = detailData[futureId];
    if (futureData) {
      setSelectedFuture(futureData);
    }
  };

  const handleCloseDetailView = () => {
    setSelectedFuture(null);
  };

  // 如果还没有选择版本，显示选择界面
  if (!selectedVersion) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <div className="relative z-30">
          <HeroSection onVersionSelect={handleVersionChange} />
        </div>
      </div>
    );
  }

  // 选择了版本后显示内容
  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* 主要内容区域 */}
      <div className="relative z-30 pt-20">
        <FuturesOverview 
          futures={currentVersion.futures}
          onFutureClick={handleFutureClick}
        />
      </div>

      {/* DetailView Modal */}
      {selectedFuture && (
        <DetailView 
          future={selectedFuture}
          onClose={handleCloseDetailView}
        />
      )}
    </div>
  );
}
