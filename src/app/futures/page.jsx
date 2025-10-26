"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import VersionSelector from "./components/VersionSelector";
import FuturesOverview from "./components/FuturesOverview";
import HeroSection from "./components/HeroSection";

// 模拟数据 - 后期可以替换为CMS数据
const versionsData = {
  "all-industries": {
    id: "all-industries",
    name: "All Industries",
    futures: [
      {
        id: "constraint",
        title: "CONSTRAINT",
        description: "AI stalls – scaled and common, but no gains in accuracy, reliability, training, or efficiency.",
        color: "#FF6B6B"
      },
      {
        id: "growth",
        title: "GROWTH", 
        description: "Barriers drop; AI is everywhere, driving mostly positive business and social impact.",
        color: "#4ECDC4"
      },
      {
        id: "transform",
        title: "TRANSFORM",
        description: "Progress in AI for the last 5 years has exceeded expectations in almost every dimension.",
        color: "#45B7D1"
      },
      {
        id: "collapse",
        title: "COLLAPSE",
        description: "AI fundamentally changes how we work, live, and interact with technology.",
        color: "#96CEB4"
      }
    ]
  },
  "consumer-products": {
    id: "consumer-products",
    name: "Consumer Products",
    futures: [
      {
        id: "constraint-cp",
        title: "CONSTRAINT",
        description: "Consumer AI products plateau with limited innovation and user adoption challenges.",
        color: "#FF6B6B"
      },
      {
        id: "growth-cp",
        title: "GROWTH",
        description: "AI-powered consumer products become mainstream, enhancing daily life experiences.",
        color: "#4ECDC4"
      },
      {
        id: "transform-cp",
        title: "TRANSFORM", 
        description: "Consumer products are completely reimagined with AI at their core.",
        color: "#45B7D1"
      },
      {
        id: "collapse-cp",
        title: "COLLAPSE",
        description: "AI collapses traditional consumer product categories and creates new markets.",
        color: "#96CEB4"
      }
    ]
  }
};

export default function FuturesPage() {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const router = useRouter();

  const currentVersion = selectedVersion ? versionsData[selectedVersion] : null;

  const handleVersionChange = (versionId) => {
    setSelectedVersion(versionId);
  };

  const handleFutureClick = (futureId) => {
    router.push(`/futures/${futureId}`);
  };

  // 如果还没有选择版本，显示选择界面
  if (!selectedVersion) {
    return (
      <div className="min-h-screen bg-black text-white">
        <HeroSection onVersionSelect={handleVersionChange} />
      </div>
    );
  }

  // 选择了版本后显示内容
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 主要内容区域 */}
      <div className="pt-20">
        <FuturesOverview 
          futures={currentVersion.futures}
          onFutureClick={handleFutureClick}
        />
      </div>
    </div>
  );
}
