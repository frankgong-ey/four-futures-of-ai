"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ResultsSummarySection from "./ResultsSummarySection";
import { useSearchParams } from "next/navigation";

// Disable SSR, only render on client (requires WebGL)
const LiveVotesGlobe = dynamic(() => import("./LiveVotesGlobe"), { ssr: false });

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const userVote = searchParams.get('vote');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual results from Supabase
    // const fetchResults = async () => {
    //   const { data } = await supabase
    //     .from('votes')
    //     .select('future_id')
    //   // ... process data
    //   setResults(mockResults);
    // };
    
    // Temporarily use mock data
    setTimeout(() => {
      setResults({
        totalParticipants: 2103,
        userVote: userVote || null,
        sinceDate: "June 5, 2025",
        results: [
          { id: "constraint", percentage: 24, color: "#750D5D", icon: "🔗" },
          { id: "growth", percentage: 12, color: "#2BB856", icon: "⚡" },
          { id: "transform", percentage: 56, color: "#198CE6", icon: "🌟" },
          { id: "collapse", percentage: 8, color: "#FF4136", icon: "⭕" }
        ]
      });
      setLoading(false);
    }, 500);
  }, [userVote]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="bg-black relative min-h-screen">
      {/* Background layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero_gradient.svg)', opacity: 0.5 }}
      />

      {/* Fullscreen 3D Canvas layer */}
      <LiveVotesGlobe />

      {/* Content layer */}
      <div className="relative z-10">
        <ResultsSummarySection results={results} />
      </div>
    </div>
  );
}

