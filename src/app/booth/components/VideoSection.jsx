"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import TextReveal from "../../../components/TextReveal";

// 注册插件
gsap.registerPlugin(ScrollTrigger, SplitText);

// ChartSection组件 - 100vh高度，包含图表和趋势线动画
export default function VideoSection() {
  // 内部创建 refs
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  
  // 立即隐藏文字元素，防止闪现 - 使用useLayoutEffect确保在DOM渲染后立即执行
  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    
    // 立即隐藏所有文字元素
    const textElements = sectionRef.current.querySelectorAll('[data-text-reveal]');
    textElements.forEach((element) => {
      gsap.set(element, { autoAlpha: 0 });
    });
  }, []);
  
  // VideoSection 动画初始化 - 使用ScrollTrigger控制TextReveal
  useEffect(() => {
    if (!sectionRef.current) return;

    // 创建ScrollTrigger来控制TextReveal动画
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 80%",
      onEnter: () => {
        // 当section进入视口时，触发TextReveal动画
        const textElements = sectionRef.current.querySelectorAll('[data-text-reveal]');
        
        textElements.forEach((element, index) => {
          // 使用SplitText分割文字
          const split = new SplitText(element, {
            type: "lines",
            linesClass: "reveal-line"
          });

          // 为每一行创建遮罩效果
          const masks = split.lines.map((line) => {
            // 设置行元素的样式
            Object.assign(line.style, {
              position: 'relative',
              overflow: 'hidden'
            });
            
            // 创建遮罩容器
            const maskContainer = document.createElement('div');
            Object.assign(maskContainer.style, {
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden'
            });
            
            // 将文字内容移动到遮罩容器中
            const textContent = line.innerHTML;
            line.innerHTML = '';
            maskContainer.innerHTML = textContent;
            line.appendChild(maskContainer);
            
            // 设置文字初始状态 - 从下方隐藏
            gsap.set(maskContainer, { y: "100%" });
            
            return maskContainer;
          });

          // 创建动画时间线
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