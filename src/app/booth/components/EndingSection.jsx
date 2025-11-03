"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import TextReveal from "../../../components/TextReveal";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// EndingSection - 100vh height, contains quote reveal animation
export default function EndingSection() {
  // Local refs
  const sectionRef = useRef(null);
  
  // Immediately hide text to avoid flash - useLayoutEffect so it runs after mount
  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    
    // Immediately hide all text elements
    const textElements = sectionRef.current.querySelectorAll('[data-text-reveal]');
    textElements.forEach((element) => {
      gsap.set(element, { autoAlpha: 0 });
    });
  }, []);
  
  // EndingSection animation init - control TextReveal via ScrollTrigger
  useEffect(() => {
    if (!sectionRef.current) return;

    // Create ScrollTrigger to control TextReveal
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 80%",
      onEnter: () => {
        // When section enters viewport, trigger TextReveal
        const textElements = sectionRef.current.querySelectorAll('[data-text-reveal]');
        
        textElements.forEach((element, index) => {
          // Split text into lines
          const split = new SplitText(element, {
            type: "lines",
            linesClass: "reveal-line"
          });

          // Create mask for each line
          const masks = split.lines.map((line) => {
            // Style each line element
            Object.assign(line.style, {
              position: 'relative',
              overflow: 'hidden'
            });
            
            // Create mask container
            const maskContainer = document.createElement('div');
            Object.assign(maskContainer.style, {
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden'
            });
            
            // Move text content into mask container
            const textContent = line.innerHTML;
            line.innerHTML = '';
            maskContainer.innerHTML = textContent;
            line.appendChild(maskContainer);
            
            // Initial state: hidden from bottom
            gsap.set(maskContainer, { y: "100%" });
            
            return maskContainer;
          });

          // Create a timeline
          const tl = gsap.timeline();
          
          // Animate each mask container
          masks.forEach((mask, maskIndex) => {
            tl.to(mask, {
              y: "0%",
              duration: 0.8,
              ease: "power3.out"
            }, 0.5 + (index * 0.2) + (maskIndex * 0.1));
          });

          // Ensure element becomes visible via autoAlpha
          gsap.set(element, { autoAlpha: 1 });
        });
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative w-full h-screen bg-transparent"
    >
      <div className="flex items-center justify-center h-full px-[16px] md:px-[64px] sm:px-[16px] z-10">
        <div className="grid grid-cols-12 gap-[24px]">
          {/* 标题 1-8 列 */}
          <div className="col-span-8 col-start-1 flex flex-col gap-[16px] items-start">
            <TextReveal
              as="h2"
              className="text-4xl md:text-[80px] sm:text-3xl leading-none text-white"
              delay={0.5}
              stagger={0.2}
              enabled={false}
              data-text-reveal="true"
            >
              "In dealing with the future, it's more important to be <span className='underline'>imaginative</span> than to be right."
            </TextReveal>
          </div>
          {/* 标题 4-8 列 */}
          <div className="col-span-4 col-start-4 flex flex-col gap-[8px] items-start">
            <TextReveal
              as="div"
              className="font-light text-[24px] text-white/80"
              delay={1.0}
              stagger={0.1}
              enabled={false}
              data-text-reveal="true"
            >
              Alvin Toffler
            </TextReveal>
            <TextReveal
              as="div"
              className="font-light text-[16px] text-white/80"
              delay={1.2}
              stagger={0.1}
              enabled={false}
              data-text-reveal="true"
            >
              Author of <span className="italic font-medium">Future Shock</span> and <span className="italic font-medium">The Third Wave</span>
            </TextReveal>
          </div>
        </div>
      </div>
    </div>
  );
}