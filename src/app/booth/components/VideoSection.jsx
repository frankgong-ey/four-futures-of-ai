"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import TextReveal from "../../../components/TextReveal";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// VideoSection - 100vh height, contains reveal animations
export default function VideoSection({ onPlayClick }) {
  // Local refs
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  
  // Hide text immediately to avoid flash - useLayoutEffect ensures it runs right after mount
  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    
    // Immediately hide all text elements
    const textElements = sectionRef.current.querySelectorAll('[data-text-reveal]');
    textElements.forEach((element) => {
      gsap.set(element, { autoAlpha: 0 });
    });
  }, []);
  
  // VideoSection animation init - control TextReveal via ScrollTrigger
  useEffect(() => {
    if (!sectionRef.current) return;

    // Create ScrollTrigger to control TextReveal animations
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 80%",
      onEnter: () => {
        // When section enters viewport, trigger TextReveal animation
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
            
            // Move original content into mask container
            const textContent = line.innerHTML;
            line.innerHTML = '';
            maskContainer.innerHTML = textContent;
            line.appendChild(maskContainer);
            
            // Initial state - hidden from bottom
            gsap.set(maskContainer, { y: "100%" });
            
            return maskContainer;
          });

          // Create timeline
          const tl = gsap.timeline();
          
          // 为每个遮罩容器创建动画
          masks.forEach((mask, maskIndex) => {
            tl.to(mask, {
              y: "0%",
              duration: 0.8,
              ease: "power3.out"
            }, 0.5 + (index * 0.2) + (maskIndex * 0.1));
          });

          // 使用autoAlpha设置元素可见
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
      <div ref={titleRef} className="pt-[120px] px-[16px] md:px-[64px] sm:px-[16px] relative z-20">
        <div className="grid grid-cols-12 gap-[24px]">
          {/* 标题 1-8 列 */}
          <div className="col-span-6 col-start-1 flex flex-col gap-[16px] items-start">
            <TextReveal
              as="div"
              className="font-bold text-[24px] text-white/80"
              delay={0.5}
              stagger={0.2}
              enabled={false}
              data-text-reveal="true"
            >
              Introducing
            </TextReveal>
            <TextReveal
              ref={titleRef}
              as="h2"
              className="text-4xl md:text-[120px] sm:text-3xl leading-none text-white"
              delay={0.8}
              stagger={0.3}
              enabled={false}
              data-text-reveal="true"
            >
              The Four Futures of AI
            </TextReveal>
          </div>
        </div>
      </div>

      <div className="mt-[-120px] px-[16px] md:px-[64px] sm:px-[16px] relative z-10">
        <div className="grid grid-cols-12 gap-[24px]">
          {/* 视频缩略图 6-12 列 */}
          <div className="col-span-8 col-start-3 flex justify-center items-center">
            <div className="relative w-full max-w-[800px] aspect-video">
              <img
                src="/images/video_thumbnail.jpg"
                className="w-full h-full object-cover"
              />
              {/* 播放卡片 - 不受 GSAP 动画影响 */}
               <div className="absolute right-0 bottom-[-48px] w-[320px] flex flex-col items-start justify-start gap-[16px]">
                <div className="relative w-[320px] h-[200px] p-[24px] flex-col items-start justify-start bg-black/20 backdrop-blur-md outline outline-white/20 gap-[8px] will-change-transform transform-gpu">
                  <div className="font-light text-[24px] text-white">Watch Intro Video</div>
                  <div className="font-light text-[16px] text-white/60">01:23</div>
                  <button 
                    onClick={onPlayClick}
                    className="absolute right-[24px] bottom-[24px] w-[64px] h-[64px] p-[16px] bg-white flex items-center justify-center cursor-pointer rounded-full hover:bg-white/90 transition-all duration-500"
                  >
                      <img src="/images/play_dark.svg" className="w-full h-full object-cover" alt="Play"/>
                  </button>
                </div>
                 <Link 
                   href="/futures"
                   className="group relative w-[320px] h-[200px] p-[24px] flex-col items-start justify-start bg-white cursor-pointer block"
                 >
                   <div className="font-light text-[16px] text-black/60">Next Chapter</div>
                   <div className="font-light text-[24px] text-black">Explore Four Futures</div>
                  <div className="absolute right-[24px] bottom-[24px] w-[64px] h-[64px] flex items-center justify-center">
                      <img src="/images/next_right.svg" className="w-full h-full object-cover transition-transform duration-300 group-hover:translate-x-1"/>
                  </div>
                 </Link>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}