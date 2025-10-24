"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";

// ChartSection组件 - 100vh高度，包含图表和趋势线动画
export default function VideoSection() {
  // 内部创建 refs
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  
  // VideoSection 动画初始化 - 只对标题部分应用动画
  useEffect(() => {
    if (titleRef.current) {
      // 设置标题初始状态
      gsap.set(titleRef.current, { opacity: 0 });
      
      // 只对标题部分应用淡入淡出动画
      const titleEntranceTween = gsap.to(titleRef.current, {
        opacity: 1,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 50%",
          end: "bottom 50%",
          markers: true,
          toggleActions: "play reverse play reverse",
        }
      });

      // 清理函数
      return () => {
        titleEntranceTween.kill();
      };
    }
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
            <div className="font-bold text-[24px] text-white/80">Introducing</div>
            <h2 className="text-4xl md:text-[120px] sm:text-3xl leading-none text-white">
              The Four Futures of AI
            </h2>
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
                  <div className="absolute right-[24px] bottom-[24px] w-[64px] h-[64px] p-[16px] bg-white flex items-center justify-center cursor-pointer rounded-full hover:bg-white/90 transition-all duration-500">
                      <img src="/images/play_dark.svg" className="w-full h-full object-cover"/>
                  </div>
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