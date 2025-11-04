"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Prompt card component
function PromptCard({ text, isActive, progress }) {
  return (
    <div className={`relative w-[100%] p-[8px] bg-black/10 backdrop-blur-xl border border-white/40 will-change-[transform,opacity] transition-transform transition-opacity duration-500 ease-in-out ${
      isActive 
        ? 'opacity-100 transform translate-y-0 scale-105 bg-black bg-opacity-50 shadow-2xl' 
        : 'opacity-30 transform translate-y-5 scale-90'
    }`}>
      <p className="text-white text-[16px] font-medium mb-2.5">Prompt</p>
      <p className="text-white/80 text-sm leading-relaxed">{text}</p>
      <div className="mt-1 text-[11px] text-white/60">{(progress * 100).toFixed(16)}%</div>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden`}>
        <div 
          className="h-full bg-white rounded-sm will-change-[width" 
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>
    </div>
  );
}

// Main GallerySection component
export default function GallerySection({ localScrollProgress = 0 }) {
  const sectionRef = useRef(null);

  // Use localScrollProgress to drive opacity, fade out from 90%-100%
  const opacity = localScrollProgress >= 0.9 ? 1 - (localScrollProgress - 0.9) / 0.1 : 1;

  useEffect(() => {
    if (sectionRef.current) {
      gsap.to(sectionRef.current, {
        opacity: opacity,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, [opacity]);

  const promptCards = [
    "Sophisticated man with glasses and salt-and-pepper beard in cozy indoor setting, studio light, Bokeh effect, shallow depth of field.",
    "An art illustration abstract artistic portrait of a woman surrounded by swirling waves of colorful light. ",
    "Abstract futuristic 3D explosion, geometric structures and shards bursting in midair, metallic and glass fragments floating.",
    "A cinematic still frame of a narrow alley in a bustling Singapore food market. - warm golden and neon lights reflecting off wet pavement.",
    "Perfume advertising video, the bottle is in the clouds.",
  ];

  return (
    <div ref={sectionRef} className="relative w-screen h-screen bg-transparent z-20">
        {/* HTML content */}
                {/* Bottom title - absolute positioned, 120px from bottom */}
        <div className="absolute bottom-[120px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-50">
            <div className="grid grid-cols-12 gap-[24px]">
            <div className="col-span-4 col-start-1 text-left flex flex-col gap-[16px] items-start">
                <h2 
                    className="text-4xl md:text-[96px] sm:text-3xl leading-none tracking-[-0.05em] text-white"
                >
                    The rapid growth of AI 
                </h2>
                <div className="font-light text-white/80">In recent years, we have seen major improvements in AI across image and video creation capabilities</div>
            </div>
            </div>
        </div>
      <div className="relative h-[400vh] flex justify-center items-start">
        {/* Center column spacer */}
        <div className="w-80 h-screen flex flex-col justify-center items-center bg-black/0 sticky top-0">
          {/* Prompt card carousel */}
          <div className="relative w-full h-screen flex flex-col justify-center items-center space-y-8">
            {promptCards.map((text, index) => {
              // Use provided localScrollProgress (0-1)
              const p = localScrollProgress;

              // Define highlight range [start, end) for each card
              const ranges = [
                [0.06, 0.22], // first
                [0.23, 0.39], // second
                [0.40, 0.55], // third
                [0.56, 0.72], // fourth
                [0.73, 0.88], // fifth
              ];

              const [start, end] = ranges[index] || [1, 1];
              const isActive = p >= start && p < end;

              // Progress bar logic:
              // p <= start  => 0
              // start < p < end => (p-start)/(end-start)
              // p >= end => 1 (keep full until user scrolls back)
              let progress = 0;
              if (p <= start) {
                progress = 0;
              } else if (p >= end) {
                progress = 1;
              } else {
                progress = (p - start) / (end - start);
              }

              return (
                <PromptCard
                  key={index}
                  text={text}
                  isActive={isActive}
                  progress={progress}
                />
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
