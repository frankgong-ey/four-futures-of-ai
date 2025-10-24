"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DetailView from "../components/DetailView";

// 模拟详情数据 - 后期可以替换为CMS数据
const detailData = {
  "constraint": {
    id: "constraint",
    title: "CONSTRAINT",
    description: "AI stalls – scaled and common, but no gains in accuracy, reliability, training, or efficiency.",
    color: "#FF6B6B",
    content: {
      about: {
        title: "About This Future",
        description: "In the CONSTRAINT future, AI development hits a plateau. While AI systems become widespread and commonly used, they fail to deliver significant improvements in accuracy, reliability, training efficiency, or overall performance. This scenario represents a world where AI adoption is high, but innovation stagnates.",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "2:45"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "Demand for compute remains high, fueling a ramp in chip production",
            icon: "chip",
            trend: "up"
          },
          {
            title: "AI costs continue along downward trajectory", 
            icon: "money",
            trend: "down"
          },
          {
            title: "Government investment fuels sustained research",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "Focus on operational efficiency over innovation",
          "Invest in proven AI applications",
          "Build robust data infrastructure",
          "Develop human-AI collaboration frameworks"
        ]
      }
    }
  },
  "growth": {
    id: "growth",
    title: "GROWTH",
    description: "Barriers drop; AI is everywhere, driving mostly positive business and social impact.",
    color: "#4ECDC4",
    content: {
      about: {
        title: "About This Future",
        description: "The GROWTH future represents a world where AI barriers fall away, and artificial intelligence becomes ubiquitous across all sectors. This scenario is characterized by widespread positive impact on both business and society, with AI driving innovation, efficiency, and improved quality of life.",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "3:12"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "AI becomes accessible to small businesses and individuals",
            icon: "accessibility",
            trend: "up"
          },
          {
            title: "Regulatory frameworks enable rapid AI adoption",
            icon: "shield",
            trend: "up"
          },
          {
            title: "AI-human collaboration becomes seamless",
            icon: "collaboration",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "Embrace AI-first business models",
          "Invest in AI talent and training",
          "Build ethical AI frameworks",
          "Create AI-powered customer experiences"
        ]
      }
    }
  }
};

export default function FutureDetailPage({ params }) {
  const router = useRouter();
  const { futureId } = React.use(params);
  
  const futureData = detailData[futureId];

  if (!futureData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Future not found</h1>
          <button 
            onClick={() => router.push('/futures')}
            className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Back to Futures
          </button>
        </div>
      </div>
    );
  }

  return (
    <DetailView 
      future={futureData}
      onClose={() => router.push('/futures')}
    />
  );
}
