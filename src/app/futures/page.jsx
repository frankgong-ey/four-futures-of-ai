"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        color: "#750D5D"
      },
      {
        id: "growth",
        title: "GROWTH", 
        description: "Barriers drop; AI is everywhere, driving mostly positive business and social impact.",
        color: "#2BB856"
      },
      {
        id: "transform",
        title: "TRANSFORM",
        description: "Progress in AI for the last 5 years has exceeded expectations in almost every dimension.",
        color: "#198CE6"
      },
      {
        id: "collapse",
        title: "COLLAPSE",
        description: "AI fundamentally changes how we work, live, and interact with technology.",
        color: "#FF4136"
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
        color: "#750D5D"
      },
      {
        id: "growth-cp",
        title: "GROWTH",
        description: "AI-powered consumer products become mainstream, enhancing daily life experiences.",
        color: "#2BB856"
      },
      {
        id: "transform-cp",
        title: "TRANSFORM", 
        description: "Consumer products are completely reimagined with AI at their core.",
        color: "#198CE6"
      },
      {
        id: "collapse-cp",
        title: "COLLAPSE",
        description: "AI collapses traditional consumer product categories and creates new markets.",
        color: "#FF4136"
      }
    ]
  },
  "industrial-products": {
    id: "industrial-products",
    name: "Industrial Products",
    futures: [
      {
        id: "constraint-ip",
        title: "CONSTRAINT",
        description: "[Enter description]",
        color: "#750D5D"
      },
      {
        id: "growth-ip",
        title: "GROWTH",
        description: "[Enter description]",
        color: "#2BB856"
      },
      {
        id: "transform-ip",
        title: "TRANSFORM",
        description: "[Enter description]",
        color: "#198CE6"
      },
      {
        id: "collapse-ip",
        title: "COLLAPSE",
        description: "[Enter description]",
        color: "#FF4136"
      }
    ]
  },
  "oil-gas": {
    id: "oil-gas",
    name: "Oil & Gas",
    futures: [
      {
        id: "constraint-og",
        title: "CONSTRAINT",
        description: "[Enter description]",
        color: "#750D5D"
      },
      {
        id: "growth-og",
        title: "GROWTH",
        description: "[Enter description]",
        color: "#2BB856"
      },
      {
        id: "transform-og",
        title: "TRANSFORM",
        description: "[Enter description]",
        color: "#198CE6"
      },
      {
        id: "collapse-og",
        title: "COLLAPSE",
        description: "[Enter description]",
        color: "#FF4136"
      }
    ]
  },
  "defense": {
    id: "defense",
    name: "Defense",
    futures: [
      {
        id: "constraint-d",
        title: "CONSTRAINT",
        description: "[Enter description]",
        color: "#750D5D"
      },
      {
        id: "growth-d",
        title: "GROWTH",
        description: "[Enter description]",
        color: "#2BB856"
      },
      {
        id: "transform-d",
        title: "TRANSFORM",
        description: "[Enter description]",
        color: "#198CE6"
      },
      {
        id: "collapse-d",
        title: "COLLAPSE",
        description: "[Enter description]",
        color: "#FF4136"
      }
    ]
  },
  "banking-capital-markets": {
    id: "banking-capital-markets",
    name: "Banking & Capital Markets",
    futures: [
      {
        id: "constraint-bcm",
        title: "CONSTRAINT",
        description: "[Enter description]",
        color: "#750D5D"
      },
      {
        id: "growth-bcm",
        title: "GROWTH",
        description: "[Enter description]",
        color: "#2BB856"
      },
      {
        id: "transform-bcm",
        title: "TRANSFORM",
        description: "[Enter description]",
        color: "#198CE6"
      },
      {
        id: "collapse-bcm",
        title: "COLLAPSE",
        description: "[Enter description]",
        color: "#FF4136"
      }
    ]
  },
  "retail": {
    id: "retail",
    name: "Retail",
    futures: [
      {
        id: "constraint-r",
        title: "CONSTRAINT",
        description: "[Enter description]",
        color: "#750D5D"
      },
      {
        id: "growth-r",
        title: "GROWTH",
        description: "[Enter description]",
        color: "#2BB856"
      },
      {
        id: "transform-r",
        title: "TRANSFORM",
        description: "[Enter description]",
        color: "#198CE6"
      },
      {
        id: "collapse-r",
        title: "COLLAPSE",
        description: "[Enter description]",
        color: "#FF4136"
      }
    ]
  },
  "life-sciences": {
    id: "life-sciences",
    name: "Life Sciences",
    futures: [
      {
        id: "constraint-ls",
        title: "CONSTRAINT",
        description: "[Enter description]",
        color: "#750D5D"
      },
      {
        id: "growth-ls",
        title: "GROWTH",
        description: "[Enter description]",
        color: "#2BB856"
      },
      {
        id: "transform-ls",
        title: "TRANSFORM",
        description: "[Enter description]",
        color: "#198CE6"
      },
      {
        id: "collapse-ls",
        title: "COLLAPSE",
        description: "[Enter description]",
        color: "#FF4136"
      }
    ]
  }
};

export default function FuturesPage() {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const router = useRouter();

  const currentVersion = selectedVersion ? versionsData[selectedVersion] : null;

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
    router.push(`/futures/${futureId}`);
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
    </div>
  );
}
