"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import TextReveal from '../../../components/TextReveal';

/**
 * First screen HTML content component
 * Layout uses Tailwind's 12-column grid system
 */
export default function HeroSection({ localScrollProgress = 0, isLoaded = false }) {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const bottomTextRef = useRef(null);

  // Drive opacity using localScrollProgress: fade between 95%-100%
  const opacity = localScrollProgress >= 0.95 ? 1 - (localScrollProgress - 0.95) / 0.05 : 1;

  // Fade-out while scrolling
  useEffect(() => {
    if (titleRef.current && subtitleRef.current && bottomTextRef.current) {
      gsap.to([titleRef.current, subtitleRef.current, bottomTextRef.current], {
        opacity: opacity,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, [opacity]);

  return (
    <div className="h-screen text-white relative pointer-events-none">
      {/* Main title - uses TextReveal */}
      <div className="absolute top-[164px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-10">
        <div className="grid grid-cols-12 gap-[24px]">
          <div className="col-span-8 col-start-3 md:col-span-4 md:col-start-2 sm:col-span-12 sm:col-start-1 text-left">
            <TextReveal
              ref={titleRef}
              as="h1"
              className="text-[64px] md:text-[96px] sm:text-4xl leading-[0.9]"
              delay={0.5}
              stagger={0.3}
              enabled={isLoaded}
              style={{ 
                visibility: 'hidden'
              }}
            >
              <span className="text-white/60">Will you shape </span>the future of AI,
            </TextReveal>
          </div>
        </div>
      </div>

      {/* Bottom title - uses TextReveal */}
      <div className="absolute bottom-[120px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-10">
        <div className="grid grid-cols-12 gap-[24px]">
          <div className="col-span-2 col-start-2 text-left flex items-end">
            <div 
              ref={subtitleRef}
              className="flex flex-col text-sm gap-[8px]"
            >
              <div>2030 starts now:</div>
              <div className="font-bold">Preparing for Four Futures of AI</div>
            </div>
          </div>
          <div className="col-span-6 col-start-6 text-right">
            <TextReveal
              ref={bottomTextRef}
              as="h2"
              className="text-[64px] md:text-[96px] sm:text-3xl leading-none"
              delay={1.1} // start around 60% of the title animation
              stagger={0.3}
              enabled={isLoaded}
              style={{ 
                visibility: 'hidden'
              }}
            >
              or will it shape you?
            </TextReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
