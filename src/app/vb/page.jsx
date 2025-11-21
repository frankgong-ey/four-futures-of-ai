 "use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section1 from "./components/Section1";
import Section2 from "./components/Section2";
import Section3 from "./components/Section3";
import Section4 from "./components/Section4";
import Section5 from "./components/Section5";
import Section6 from "./components/Section6";
import Section7 from "./components/Section7";
import Section8 from "./components/Section8";
import Section9 from "./components/Section9";
import GlobalCanvasContainer from "./components/GlobalCanvasContainer";
import NavigationBar from "./components/NavigationBar";
import SuccessStoryPage from "./components/SuccessStoryPage";

gsap.registerPlugin(ScrollTrigger);

// 定义滚动位置配置
const SCROLL_POSITIONS = [
  { type: 'section', id: 1 },
  { type: 'section', id: 2 },
  { type: 'section', id: 3 },
  { type: 'section', id: 4 },
  { type: 'section5-vh', vh: 1 },
  { type: 'section5-vh', vh: 600 },
  { type: 'section5-vh', vh: 700 },
  { type: 'section5-vh', vh: 800 },
  { type: 'section5-vh', vh: 900 },
  { type: 'section5-vh', vh: 1000 },
  { type: 'section5-vh', vh: 1100 },
  { type: 'section5-vh', vh: 1200 },
  { type: 'section', id: 6 },
  { type: 'section', id: 7 },
  { type: 'section8-vh', vh: 1 },
  { type: 'section8-vh', vh: 101 },
  { type: 'section', id: 8 },
];

// 定义每个位置的滚动持续时间（毫秒）
const SCROLL_DURATIONS = [
  500, // Section 1 -> 2
  500, // Section 2 -> 3
  500, // Section 3 -> 4
  500, // Section 4 -> Section 5 vh=1
  2000, // Section 5 vh=1 -> vh=600
  2000, // Section 5 vh=600 -> vh=700
  2000, // Section 5 vh=700 -> vh=800
  2000, // Section 5 vh=800 -> vh=900
  2000, // Section 5 vh=900 -> vh=1000
  2000, // Section 5 vh=1000 -> vh=1100
  2000, // Section 5 vh=1100 -> vh=1200
  500, // Section 5 vh=1200 -> Section 6
  500, // Section 6 -> Section 7
  500, // Section 7 -> Section 8 vh=1
  2000, // Section 8 vh=1 -> vh=101
  500, // Section 8 vh=101 -> Section 9
];

export default function VBTestPage() {
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollProgress8, setScrollProgress8] = useState(0);
  const [activeSection, setActiveSection] = useState(null); // 'section5' | 'section8' | null
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showSuccessStory, setShowSuccessStory] = useState(false);
  const [showEYLogo, setShowEYLogo] = useState(false);
  const savedScrollPositionRef = useRef(null);
  const scrollSectionRef = useRef(null);
  const scrollSectionRef8 = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const section6Ref = useRef(null);
  const section7Ref = useRef(null);
  const section8Ref = useRef(null);
  
  // Layer 信息配置
  const layerInfo = [
    {
      title: 'System of Record',
      description: 'Expose sources of truth through reliable connectors for agent and human interaction.',
    },
    {
      title: 'Agentic Platform',
      description: 'Leverage the Agentic Enterprise Tech Stack to upgrade technology infrastructure to support AI at scale.',
    },
    {
      title: 'Intelligence',
      description: 'Encode enterprise knowledge and Implement advanced AI and analytics to enhance decision-making and insights.',
    },
    {
      title: 'Trust',
      description: "Leverage EY's Responsible AI Framework to implement controls, guardrails and security in systems and data.",
    },
    {
      title: 'Processes',
      description: 'Leverage methodologies such as contact engineering to streamline and improve core business processes.',
    },
    {
      title: 'Workforce',
      description: 'Implement a collaborative human-AI workforce model leveraging role-based interfaces and operating systems.',
    },
    {
      title: 'Constituent',
      description: "Leverage EY's venture-building expertise to create new experiences, products, and business models.",
    },
  ];
  
  // 确保只在客户端挂载后执行
  useEffect(() => {
    setMounted(true);
    
    // 清理函数：确保在组件卸载时恢复页面滚动
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 处理打开 Success Story 页面
  const handleOpenSuccessStory = () => {
    // 保存当前滚动位置
    savedScrollPositionRef.current = window.scrollY || window.pageYOffset;
    // 滚动到页面顶部
    window.scrollTo(0, 0);
    // 显示子页面
    setShowSuccessStory(true);
  };

  // 处理返回主页面
  const handleBackToMain = () => {
    // 隐藏子页面
    setShowSuccessStory(false);
    // 恢复滚动位置
    if (savedScrollPositionRef.current !== null) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        window.scrollTo(0, savedScrollPositionRef.current);
        savedScrollPositionRef.current = null;
      });
    }
  };

  // 根据当前滚动位置更新位置索引
  useEffect(() => {
    if (!mounted || isScrolling) return;

    const updateCurrentPosition = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;

      // 检查每个位置，找到最接近当前位置的
      let closestIndex = 0;
      let closestDistance = Infinity;

      SCROLL_POSITIONS.forEach((position, index) => {
        let targetY = 0;

        if (position.type === 'section') {
          const sectionRefs = {
            1: section1Ref,
            2: section2Ref,
            3: section3Ref,
            4: section4Ref,
        6: section6Ref,
        7: section7Ref,
        8: section8Ref,
          };
          const ref = sectionRefs[position.id];
          if (ref?.current) {
            targetY = ref.current.offsetTop;
          }
        } else if (position.type === 'section5-vh') {
          if (scrollSectionRef.current) {
            const section5Top = scrollSectionRef.current.offsetTop;
            const vhInPixels = (position.vh / 100) * viewportHeight;
            targetY = section5Top + vhInPixels;
          }
        } else if (position.type === 'section8-vh') {
          if (scrollSectionRef8.current) {
            const section8Top = scrollSectionRef8.current.offsetTop;
            const vhInPixels = (position.vh / 100) * viewportHeight;
            targetY = section8Top + vhInPixels;
          }
        }

        const distance = Math.abs(scrollY - targetY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // 只有当距离足够近时才更新（避免频繁更新）
      if (closestDistance < viewportHeight * 0.5) {
        setCurrentPositionIndex(closestIndex);
      }
    };

    // 初始更新
    updateCurrentPosition();

    // 监听滚动事件（使用节流）
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateCurrentPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mounted, isScrolling]);

  // 计算滚动目标位置
  const calculateScrollTarget = (positionIndex) => {
    const position = SCROLL_POSITIONS[positionIndex];
    if (!position) return null;

    if (position.type === 'section') {
      // 普通section，滚动到section顶部
      const sectionRefs = {
        1: section1Ref,
        2: section2Ref,
        3: section3Ref,
        4: section4Ref,
        6: section6Ref,
        7: section7Ref,
        8: section8Ref,
      };
      const ref = sectionRefs[position.id];
      if (ref?.current) {
        return {
          element: ref.current,
          offset: ref.current.offsetTop,
        };
      }
    } else if (position.type === 'section5-vh') {
      // Section5的特定vh位置
      if (scrollSectionRef.current) {
        const section5Top = scrollSectionRef.current.offsetTop;
        const vhInPixels = (position.vh / 100) * window.innerHeight;
        return {
          element: scrollSectionRef.current,
          offset: section5Top + vhInPixels,
        };
      }
    } else if (position.type === 'section8-vh') {
      // Section8的特定vh位置
      if (scrollSectionRef8.current) {
        const section8Top = scrollSectionRef8.current.offsetTop;
        const vhInPixels = (position.vh / 100) * window.innerHeight;
        return {
          element: scrollSectionRef8.current,
          offset: section8Top + vhInPixels,
        };
      }
    }
    return null;
  };

  // 导航到指定位置
  const handleNavigate = (targetIndex) => {
    if (isScrolling || targetIndex < 0 || targetIndex >= SCROLL_POSITIONS.length) {
      return;
    }

    const sourceIndex = currentPositionIndex;
    setIsScrolling(true);
    setCurrentPositionIndex(targetIndex);

    const target = calculateScrollTarget(targetIndex);
    if (!target) {
      setIsScrolling(false);
      return;
    }

    // 获取滚动持续时间
    // SCROLL_DURATIONS对应从当前位置到下一个位置的持续时间
    // 根据方向选择正确的持续时间索引
    const isForward = targetIndex > sourceIndex;
    const stepIndex = isForward ? sourceIndex : targetIndex;
    const duration = stepIndex >= 0 && stepIndex < SCROLL_DURATIONS.length 
      ? SCROLL_DURATIONS[stepIndex] 
      : 500;

    // 禁用页面滚动（防止用户手动滚动干扰动画）
    document.body.style.overflow = 'hidden';

    // 获取当前滚动位置
    const startY = window.scrollY || window.pageYOffset;
    const targetY = target.offset;
    const distance = targetY - startY;
    const startTime = performance.now();

    // 使用requestAnimationFrame实现平滑滚动
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用easeInOut缓动函数
      const easeInOut = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentY = startY + distance * easeInOut;
      window.scrollTo(0, currentY);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // 确保最终位置准确
        window.scrollTo(0, targetY);
        // 恢复页面滚动
        document.body.style.overflow = '';
        setIsScrolling(false);
      }
    };

    requestAnimationFrame(animateScroll);
  };
  
  // 设置滚动触发器（控制3D部分的滚动范围）
  useEffect(() => {
    if (!mounted) return;
    
    // Section5的ScrollTrigger
    const trigger = ScrollTrigger.create({
      trigger: scrollSectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
        if (self.isActive) setActiveSection('section5');
      },
      onEnter: () => setActiveSection('section5'),
      onLeave: () => {
        // 只有在进入Section8之前才清空
        if (!scrollSectionRef8.current) return;
        const rect8 = scrollSectionRef8.current.getBoundingClientRect();
        if (rect8.top > window.innerHeight) {
          setActiveSection(null);
        }
      },
      onEnterBack: () => setActiveSection('section5'),
      onLeaveBack: () => setActiveSection(null),
    });
    
    // Section8的ScrollTrigger
    // start: "top bottom" 表示当 section8 的顶部进入视口底部时开始计算（progress = 0）
    // end: "bottom bottom" 表示当 section8 的底部到达视口底部时结束（progress = 1）
    // 这样从开始进入屏幕到完全滚过屏幕正好是 300vh 的滚动距离（section8高度）
    const trigger8 = ScrollTrigger.create({
      trigger: scrollSectionRef8.current,
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress8(self.progress);
        if (self.isActive) {
          setActiveSection('section8');
        } else if (self.progress >= 1) {
          // 如果已经滚动到section8的最后（progress = 1），保持section8激活
          setActiveSection('section8');
        }
      },
      onEnter: () => setActiveSection('section8'),
      onLeave: () => {
        // 只有在真正离开section8区域时才设置（检查是否还有section8在视口中）
        if (scrollSectionRef8.current) {
          const rect8 = scrollSectionRef8.current.getBoundingClientRect();
          // 如果section8完全离开视口（底部在视口顶部之上），才设置为null
          if (rect8.bottom < 0) {
            setActiveSection(null);
          } else {
            // 否则保持section8激活（保持在最后阶段）
            setActiveSection('section8');
          }
        }
      },
      onEnterBack: () => setActiveSection('section8'),
      onLeaveBack: () => {
        // 如果离开Section8回到Section5，保持Section5激活
        const rect5 = scrollSectionRef.current?.getBoundingClientRect();
        if (rect5 && rect5.top <= window.innerHeight && rect5.bottom > 0) {
          setActiveSection('section5');
        } else {
          // 否则保持section8激活（向上滚动时保持在最后阶段）
          setActiveSection('section8');
        }
      },
    });
    
    return () => {
      trigger.kill();
      trigger8.kill();
    };
  }, [mounted]);

  // 监听滚动，控制EY logo的显示/隐藏
  useEffect(() => {
    if (!mounted || !section1Ref.current) return;

    const checkScrollPosition = () => {
      if (section1Ref.current) {
        const section1Bottom = section1Ref.current.offsetTop + section1Ref.current.offsetHeight;
        const scrollY = window.scrollY || window.pageYOffset;
        setShowEYLogo(scrollY > section1Bottom);
      }
    };

    // 初始检查
    checkScrollPosition();

    // 监听滚动事件
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mounted]);

  // 如果显示 Success Story 页面，只渲染子页面
  if (showSuccessStory) {
    return (
      <SuccessStoryPage onBack={handleBackToMain} />
    );
  }

  return (
    <>
      {/* 全局Canvas容器 - fixed定位，根据activeSection切换内容 */}
      {/* 只在主页面显示时渲染 3D canvas */}
      {!showSuccessStory && (
        <GlobalCanvasContainer
          activeSection={activeSection}
          scrollProgress5={scrollProgress}
          scrollProgress8={scrollProgress8}
          mounted={mounted}
          layerInfo={layerInfo}
        />
      )}

      {/* Fixed EY Logo - 在section1之外时显示 */}
      {!showSuccessStory && (
        <div
          className="fixed z-[9999] cursor-pointer transition-opacity duration-500 ease-in-out"
          style={{
            left: '16px',
            top: '16px',
            width: '40px',
            height: '40px',
            opacity: showEYLogo ? 1 : 0,
            pointerEvents: showEYLogo ? 'auto' : 'none',
          }}
          onClick={() => {
            if (showEYLogo) {
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }
          }}
        >
          <img
            src="/images/EY_logo.svg"
            alt="EY"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      <div ref={section1Ref}>
        <Section1 onGetStartedClick={() => handleNavigate(1)} />
      </div>
      <div ref={section2Ref}>
        <Section2 />
      </div>
      <div ref={section3Ref}>
        <Section3 />
      </div>
      <div ref={section4Ref}>
        <Section4 />
      </div>
      <Section5 
        scrollProgress={scrollProgress}
        mounted={mounted}
        layerInfo={layerInfo}
        scrollSectionRef={scrollSectionRef}
        activeSection={activeSection}
      />
      <div ref={section6Ref}>
        <Section6 />
      </div>
      <div ref={section7Ref}>
        <Section7 onRiskAssessmentClick={handleOpenSuccessStory} />
      </div>
      <Section8
        scrollSectionRef={scrollSectionRef8}
      />
      <div ref={section8Ref}>
        <Section9 />
      </div>

      {/* 导航栏 */}
      {mounted && !showSuccessStory && (
        <NavigationBar
          onNavigate={handleNavigate}
          currentPositionIndex={currentPositionIndex}
          isScrolling={isScrolling}
          sectionRefs={{
            section1: section1Ref,
            section2: section2Ref,
            section3: section3Ref,
            section4: section4Ref,
            section5: scrollSectionRef,
            section6: section6Ref,
            section7: section7Ref,
            section8: scrollSectionRef8,
            section9: section8Ref,
          }}
        />
      )}
    </>
  );
}
