"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NextChapterSection() {
  const router = useRouter();

  const handleGoToVote = () => {
    router.push('/vote');
  };

  return (
    <div className="relative px-16 min-h-screen pt-[120px] pb-16">
      {/* Background gradient image - full width, absolute position, bottom aligned */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full h-full"
        style={{
          backgroundImage: 'url(/images/hero_gradient_new.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      
      {/* Content wrapper with z-index */}
      <div className="relative z-10 grid grid-cols-12 gap-[24px]">
        {/* Left side - Title and Icons */}
        <div className="col-span-4 col-start-1 flex gap-4">
          <div className="space-y-6">
            {/* Four Icons */}
            <div className="flex gap-4">
              <div className="w-16 h-16 relative">
                <Image src="/images/constraint-logo.svg" alt="Constraint" fill className="object-contain" />
              </div>
              <div className="w-16 h-16 relative">
                <Image src="/images/growth-logo.svg" alt="Growth" fill className="object-contain" />
              </div>
              <div className="w-16 h-16 relative">
                <Image src="/images/transform-logo.svg" alt="Transform" fill className="object-contain" />
              </div>
              <div className="w-16 h-16 relative">
                <Image src="/images/collapse-logo.svg" alt="Collapse" fill className="object-contain" />
              </div>
            </div>

            {/* Main Title */}
            <div>
              <h1 className="text-5xl md:text-[96px] font-light bg-gradient-to-r from-white to-[#FCF5B9] bg-clip-text text-transparent leading-none tracking-[-0.05em]">
                Step Into the Futures of AI
              </h1>
            </div>
          </div>
        </div>
        {/* Right side - Two Cards */}
        <div className="col-span-4 col-start-8 flex flex-col gap-8">
          {/* Card 1: Test your AI readiness */}
          <div className="relative bg-white/10 backdrop-blur-md border-[1px] border-[#FFE600] px-8 pt-8">
            {/* Recommended Badge */}
            <div className="absolute top-1 right-1 text-[#FFE600] text-[14px] font-bold px-3 py-1">
              Recommended
            </div>
            
            <div className="space-y-8 pt-4">
              <h2 className="text-3xl font-light text-white">Test your AI readiness</h2>
              <p className="text-white text-base leading-relaxed">
                Are you strategically preparing for the AI future you believe in? Take a 10-question quiz to see how your current strategic plays align with your preferred AI future – then proceed to vote.
              </p>
              <button 
                className="w-full bg-[#FFE600] text-[18px] text-black font-normal py-6 px-6 hover:bg-[#FFD700] transition-colors cursor-pointer"
              >
                Start quiz
              </button>
            </div>
          </div>

          {/* Card 2: Vote for your envisioned AI future */}
          <div className="relative bg-white/10 backdrop-blur-md border-[1px] border-white/10 px-8 pt-8">
            <div className="space-y-8">
              <h2 className="text-3xl font-light text-white">Vote for your envisioned AI future</h2>
              <p className="text-white text-base leading-relaxed">
                Cast your vote for the AI trajectory you believe in and view the collective results from all participants.
              </p>
              <button 
                onClick={handleGoToVote}
                className="w-full bg-white text-[18px] text-black font-normal py-6 px-6 hover:bg-white/90 transition-colors cursor-pointer"
              >
                Vote now
              </button>
            </div>
          </div>

          <button 
            onClick={handleGoToVote}
            className="w-full bg-white/5 backdrop-blur-md border-[1px] border-white/10 text-white/60 font-normal py-6 px-6 hover:bg-white/20 transition-colors cursor-pointer"
          >
            Skip to next chapter
          </button>

        </div>

      </div>



    </div>
  );
}
