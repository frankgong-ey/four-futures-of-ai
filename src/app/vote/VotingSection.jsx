"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const futures = [
  {
    id: "constraint",
    title: "CONSTRAINT",
    description: "AI stalls – scaled and common, but no gains in accuracy, reliability, training, or efficiency.",
    icon: "🔗", // Constraint icon - intertwined loops
    color: "#750D5D"
  },
  {
    id: "growth",
    title: "GROWTH",
    description: "Barriers drop; AI is everywhere, driving mostly positive business and social impact.",
    icon: "⚡", // Growth icon - starburst
    color: "#2BB856"
  },
  {
    id: "transform",
    title: "TRANSFORM",
    description: "Progress in AI for the last 5 years has exceeded expectations in almost every dimension.",
    icon: "🌟", // Transform icon - complex star
    color: "#198CE6"
  },
  {
    id: "collapse",
    title: "COLLAPSE",
    description: "The number of companies building AI collapse into a handful of mega-players.",
    icon: "⭕", // Collapse icon - circle
    color: "#FF4136"
  }
];

export default function VotingSection() {
  const router = useRouter();
  const [selectedFuture, setSelectedFuture] = useState(null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (!selectedFuture) return;

    setIsVoting(true);
    
    try {
      // TODO: 连接到 Supabase 并保存投票
      // const { data, error } = await supabase
      //   .from('votes')
      //   .insert([{ future_id: selectedFuture, created_at: new Date() }]);
      
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 跳转到结果页面
      router.push(`/results?vote=${selectedFuture}`);
      
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-[#198CE6]">Four distinct future paths ahead.</span>
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="text-[#198CE6]">What future are you preparing for?</span>
          </h2>
          <p className="text-xl text-white/80">
            Cast your vote and explore <span className="text-[#198CE6] font-bold">2,103</span> participants' choices
          </p>
        </div>

        {/* Voting Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {futures.map((future) => (
            <button
              key={future.id}
              onClick={() => setSelectedFuture(future.id)}
              className={`
                relative p-8 bg-white/5 backdrop-blur-md border-2 rounded-xl transition-all duration-300
                hover:bg-white/10 hover:scale-105
                ${selectedFuture === future.id ? 'border-white' : 'border-white/20'}
              `}
            >
              {/* Selected Indicator */}
              {selectedFuture === future.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className="text-6xl mb-4">{future.icon}</div>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-3" style={{ color: future.color }}>
                {future.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-white/80 leading-relaxed">
                {future.description}
              </p>
            </button>
          ))}
        </div>

        {/* Vote Button */}
        <div className="text-center">
          <button
            onClick={handleVote}
            disabled={!selectedFuture || isVoting}
            className={`
              px-12 py-4 border-2 rounded-xl font-semibold text-xl transition-all duration-300
              ${selectedFuture && !isVoting
                ? 'border-white hover:bg-white hover:text-black bg-transparent'
                : 'border-white/30 text-white/30 cursor-not-allowed'
              }
            `}
          >
            {isVoting ? 'Submitting...' : 'Vote Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

