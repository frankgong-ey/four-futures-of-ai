"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import VersionSelector from "./components/VersionSelector";
import FuturesOverview from "./components/FuturesOverview";

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
        id: "transformation",
        title: "TRANSFORMATION",
        description: "AI becomes a core business capability, reshaping industries and creating new opportunities.",
        color: "#45B7D1"
      },
      {
        id: "disruption",
        title: "DISRUPTION",
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
        id: "transformation-cp",
        title: "TRANSFORMATION", 
        description: "Consumer products are completely reimagined with AI at their core.",
        color: "#45B7D1"
      },
      {
        id: "disruption-cp",
        title: "DISRUPTION",
        description: "AI disrupts traditional consumer product categories and creates new markets.",
        color: "#96CEB4"
      }
    ]
  }
};

export default function FuturesPage() {
  const [selectedVersion, setSelectedVersion] = useState("all-industries");
  const router = useRouter();

  const currentVersion = versionsData[selectedVersion];

  const handleVersionChange = (versionId) => {
    setSelectedVersion(versionId);
  };

  const handleFutureClick = (futureId) => {
    router.push(`/futures/${futureId}`);
  };

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
