"use client";

import React from "react";
import { useRouter } from "next/navigation";
import VotingSection from "./VotingSection";

export default function VotePage() {
  const router = useRouter();

  return (
    <div className="bg-black">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to exploration</span>
        </button>
      </div>
      
      <VotingSection />
    </div>
  );
}

