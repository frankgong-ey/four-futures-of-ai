"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

// QuoteSection - 100vh height, includes quotes animation
export default function QuoteSection() {
  // Local refs
  const sectionRef = useRef(null);
  const quotesRef = useRef(null);
  const titleRef = useRef(null);

  // Combine: outer fade + title fade (driven by ScrollTrigger)
  useEffect(() => {
    if (!sectionRef.current) return;

    // Initial state for container
    gsap.set(sectionRef.current, { opacity: 0 });

    // Container fade in/out
    const sectionTween = gsap.to(sectionRef.current, {
      opacity: 1,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 50%",
        end: "bottom 50%",
        toggleActions: "play reverse play reverse",
      }
    });

    // Title fade in
    let titleTween;
    if (quotesRef.current && titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0 });
      titleTween = gsap.to(titleRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: quotesRef.current,
          start: "top 72%",
          once: true,
        }
      });
    }

    return () => {
      sectionTween.kill();
      if (titleTween) titleTween.kill();
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative w-full h-screen bg-transparent"
    >
      {/* Center title (moved out from Quotes) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <h2 ref={titleRef} className="text-4xl md:text-[80px] sm:text-3xl leading-none text-white tracking-[-0.05em]">
          No one truly knows what the future of AI holds.
        </h2>
      </div>

      <Quotes 
        quotesRef={quotesRef}
      />
    </div>
  );
}

// Quotes component - 100vh, green background
function Quotes({ quotesRef }) {
  const animationRef = useRef(null);

  useEffect(() => {
    // Create animation cycle
    const createAnimationCycle = () => {
      const tl = gsap.timeline();
      
      // Debug selectors
      const rightElements = animationRef.current.querySelectorAll(".cross-right");
      const leftElements = animationRef.current.querySelectorAll(".cross-left");
      const downElements = animationRef.current.querySelectorAll(".cross-down");
      const upElements = animationRef.current.querySelectorAll(".cross-up");
      
      // Phase 1: Cross stars appear
      if (rightElements.length > 0) {
        // Set initial state first
        gsap.set([rightElements, leftElements, downElements, upElements], {
          opacity: 0,
          strokeDashoffset: 12
        });
        
        tl.to([rightElements, leftElements, downElements, upElements], {
          opacity: 1,
          strokeDashoffset: 0,
          duration: 0.5,
          ease: "power2.out"
        });
      }

      // Phase 2: Expand quote cards
      tl.to(animationRef.current.querySelectorAll(".quote-card-container"), {
        opacity: 1,
        width: "360px",
        height: "200px",
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1
      }, "+=0.5")
      .to(animationRef.current.querySelectorAll(".quote-content"), {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.1
      }, "+=0.1");

      return tl;
    };

    // Initially hide all elements
    if (animationRef.current) {
      gsap.set(animationRef.current.querySelectorAll(".cross-right, .cross-left, .cross-down, .cross-up"), {
        opacity: 0,
        strokeDashoffset: 12
      });
      gsap.set(animationRef.current.querySelectorAll(".quote-card-container"), {
        opacity: 0,
        width: "1px",
        height: "1px"
      });
    }

    // Use ScrollTrigger to start main animation
    let tl;
    if (quotesRef.current) {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: quotesRef.current,
          start: "top 70%",
          once: true,
        }
      });

      const built = createAnimationCycle();
      // Add built sequence onto the ScrollTrigger timeline
      tl.add(built);
    }

    return () => {
      if (tl) tl.kill();
    };
  }, []);

  // Quote cards data
  const quoteCards = [
    {
      id: 1,
      text: `"The looming AI monopolies"`,
      logo: "/images/Politico.svg",
      source: "Politico, 2024",
      position: { top: "20%", left: "5%" }, // 更左一点
      crossPosition: { top: "15%", left: "10%" }, // 十字星也相应左移
      direction: "bottom-left"
    },
    {
      id: 2,
      text: `"ChatGPT May Be Eroding Critical Thinking Skills, According to a New MIT Study"`,
      logo: "/images/Time.svg",
      source: "Time, 2025",
      position: { top: "25%", left: "75%" }, // 右上角
      crossPosition: { top: "20%", left: "70%" },
      direction: "bottom-right"
    },
    {
      id: 3,
      text: `"How will you respond when AI agents reshape your firm's business model?"`,
      logo: "/images/AccountingToday.svg",
      source: "Accounting Today, 2025",
      position: { top: "70%", left: "10%" }, // 左下角
      crossPosition: { top: "65%", left: "15%" },
      direction: "top-left"
    },
    {
      id: 4,
      text: `"OpenAI's Sam Altman predicts artificial superintelligence (AGI) by 2025"`,
      logo: "/images/TechRadar.svg",
      source: "Tech Radar, 2024",
      position: { top: "70%", left: "40%" }, // 中下角
      crossPosition: { top: "65%", left: "45%" },
      direction: "top-right"
    },
    {
      id: 5,
      text: `"OpenAI's $10 Million+ AI Consulting Business: Deployment Takes Center Stage"`,
      logo: "/images/Forbes.svg",
      source: "Forbes, 2025",
      position: { top: "60%", left: "80%" }, // 右下角
      crossPosition: { top: "55%", left: "75%" },
      direction: "top-left"
    }
  ];

  return (
    <div 
      ref={quotesRef}
      className="w-full h-screen bg-transparent relative px-[16px] md:px-[64px] sm:px-[16px]"
    >
      {/* 动画容器 */}
      <div ref={animationRef} className="absolute inset-0">
        {/* 5个十字和Quote Cards */}
        {quoteCards.map((card) => (
            <div key={card.id} className="absolute w-full h-full">
                {/* 白色十字 */}
                <div 
                    className="absolute w-16 h-16 pointer-events-none"
                    style={{
                    ...card.crossPosition,
                    transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* SVG 十字星 - 分解为四个线段 */}
                        <svg 
                            width="32" 
                            height="32" 
                            viewBox="0 0 32 32" 
                            className="cross-svg"
                            style={{ zIndex: 30 }}
                        >
                            {/* 右半段水平线 - 从中心向右延伸 */}
                            <line 
                            x1="16" 
                            y1="16" 
                            x2="28" 
                            y2="16" 
                            stroke="white" 
                            strokeWidth="1" 
                            className="cross-right"
                            />
                            {/* 左半段水平线 - 从中心向左延伸 */}
                            <line 
                            x1="16" 
                            y1="16" 
                            x2="4" 
                            y2="16" 
                            stroke="white" 
                            strokeWidth="1" 
                            className="cross-left"
                            />
                            {/* 下半段垂直线 - 从中心向下延伸 */}
                            <line 
                            x1="16" 
                            y1="16" 
                            x2="16" 
                            y2="28" 
                            stroke="white" 
                            strokeWidth="1" 
                            className="cross-down"
                            />
                            {/* 上半段垂直线 - 从中心向上延伸 */}
                            <line 
                            x1="16" 
                            y1="16" 
                            x2="16" 
                            y2="4" 
                            stroke="white" 
                            strokeWidth="1" 
                            className="cross-up"
                            />
                        </svg>
                    </div>
                </div>

                {/* Quote Card */}
                <div 
                    className="absolute w-1 h-1 overflow-hidden quote-card-container outline outline-1 outline-white/20"
                    style={{
                    ...card.crossPosition, // 使用十字星的位置作为起始点
                    zIndex: 10, // 设置较低的 z-index
                    // 不使用 transform: translate，让左上角直接定位在十字星位置
                    }}
                >
                    <div className="relative w-full h-full p-6 quote-card">
                        {/* Logo - 用16px x 16px的50%透明度白色正方形代替 */}
                        <div 
                            className="quote-logo absolute"
                            style={{ 
                                width: '16px',
                                height: '16px',
                                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                bottom: '16px',
                                right: '16px'
                            }}
                        />
                    
                        {/* 内容 - 初始隐藏 */}
                        <div className="relative z-10 text-white quote-content" style={{ opacity: 0 }}>
                            <p className="text-[20px] leading-relaxed mb-3 quote-text">
                                {card.text}
                            </p>
                            <div className="relative">
                                <span className="text-xs text-white/70 quote-source">
                                    {card.source}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <style jsx>{`
        .cross-svg {
          opacity: 1;
        }
        .cross-right {
          opacity: 0;
          stroke-dasharray: 12;
          stroke-dashoffset: 12;
        }
        .cross-left {
          opacity: 0;
          stroke-dasharray: 12;
          stroke-dashoffset: 12;
        }
        .cross-down {
          opacity: 0;
          stroke-dasharray: 12;
          stroke-dashoffset: 12;
        }
        .cross-up {
          opacity: 0;
          stroke-dasharray: 12;
          stroke-dashoffset: 12;
        }
        .quote-card-container {
          opacity: 0;
          width: 1px;
          height: 1px;
        }
        .quote-card {
          opacity: 1;
          transform: scale(1);
        }
        .quote-content {
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
