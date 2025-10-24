"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import TextReveal from "../../../components/TextReveal";

// 注册插件
gsap.registerPlugin(ScrollTrigger, SplitText);

// ChartSection组件 - 100vh高度，包含图表和趋势线动画
export default function EndingSection() {
  // 内部创建 refs
  const sectionRef = useRef(null);
  
  // EndingSection 动画初始化 - 使用ScrollTrigger控制TextReveal
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

          // 设置元素可见
          gsap.set(element, { opacity: 1 });
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