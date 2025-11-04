"use client";

import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// 注册 GSAP 插件
gsap.registerPlugin(ScrollToPlugin);

// 默认配置（通用页面）
const DEFAULT_SECTION_POSITIONS = [
  { name: 'section1', top: 0, duration: 1.5, ease: "power2.inOut" },
  { name: 'section2', top: 100, duration: 1.5, ease: "power2.inOut" },
];

export default function NextButton({ sections = DEFAULT_SECTION_POSITIONS }) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // QuestionSection 的问题位置配置（基于 viewProgress）
  // QuestionSection: 600vh - 1100vh (500vh 高度)
  // View 1: 600-700vh (100vh，显示 "But with foresight...")
  // Views 2-5: 700-1100vh (400vh，显示4个问题)
  // Question 1 显示: viewProgress < 0.43 (0-0.43)
  // Question 2 显示: viewProgress >= 0.43 && < 0.56
  // Question 3 显示: viewProgress >= 0.56 && < 0.69
  // Question 4 显示: viewProgress >= 0.69
  // 
  // 位置计算：
  // - View 1: 600vh (viewProgress 0)
  // - Question 1 开始位置: 700vh (viewProgress 0.2，Views 2-5 开始)
  // - Question 1 中间位置: 约 750vh (viewProgress 0.3，确保显示第一个问题)
  // - Question 2: 约 815vh (viewProgress 0.43)
  // - Question 3: 约 880vh (viewProgress 0.56)
  // - Question 4: 约 945vh (viewProgress 0.69)
  const QUESTION_POSITIONS = [
    { name: 'view1', top: 600, viewProgressThreshold: 0 },        // View 1 开始 (600vh)
    { name: 'question1', top: 700, viewProgressThreshold: 0.2 },  // Question 1 (Views 2-5 开始，700vh)
    { name: 'question2', top: 815, viewProgressThreshold: 0.43 },  // Question 2 (对应 viewProgress 0.43)
    { name: 'question3', top: 880, viewProgressThreshold: 0.56 },  // Question 3 (对应 viewProgress 0.56)
    { name: 'question4', top: 945, viewProgressThreshold: 0.69 },  // Question 4 (对应 viewProgress 0.69)
  ];

  // 计算 GallerySection 中的进度
  const getGalleryProgress = (scrollVh) => {
    const gallerySectionStart = 102; // GallerySection 开始位置 (从 sections 配置)
    const gallerySectionEnd = 400; // GallerySection 结束位置（ChartSection 开始位置）
    
    if (scrollVh < gallerySectionStart || scrollVh >= gallerySectionEnd) {
      return null; // 不在 GallerySection 中
    }
    
    // 计算在 GallerySection 中的进度 (0-1)
    const progressInSection = (scrollVh - gallerySectionStart) / (gallerySectionEnd - gallerySectionStart);
    return progressInSection;
  };

  // 计算 QuestionSection 中的 viewProgress
  const getQuestionProgress = (scrollVh) => {
    const questionSectionStart = 600; // QuestionSection 开始位置
    const questionSectionHeight = 500; // QuestionSection 高度
    const questionSectionEnd = questionSectionStart + questionSectionHeight; // 1100vh
    
    if (scrollVh < questionSectionStart || scrollVh >= questionSectionEnd) {
      return null; // 不在 QuestionSection 中
    }
    
    // 计算在 QuestionSection 中的进度 (0-1)
    const progressInSection = (scrollVh - questionSectionStart) / questionSectionHeight;
    return progressInSection;
  };

  // 监听滚动位置，确定当前在哪个section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const scrollVh = (scrollY / viewportHeight) * 100;

      // 检查是否在 QuestionSection 中
      const questionProgress = getQuestionProgress(scrollVh);
      if (questionProgress !== null) {
        // 找到当前在哪个问题（基于 viewProgress 阈值）
        let foundQuestionIndex = 0;
        for (let i = QUESTION_POSITIONS.length - 1; i >= 0; i--) {
          if (questionProgress >= QUESTION_POSITIONS[i].viewProgressThreshold) {
            foundQuestionIndex = i;
            break;
          }
        }
        setCurrentQuestionIndex(foundQuestionIndex);
      }

      // 找到当前所在的section（使用更宽容的阈值）
      // 特殊处理：gallery section 的范围是 102vh - 400vh，即使接近 400vh 也应该保持在 gallery
      let foundIndex = 0;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        // 特殊处理 gallery section：如果 scrollVh < 400，强制保持在 gallery
        if (section.name === 'gallery' && scrollVh >= section.top - 2 && scrollVh < 400) {
          foundIndex = i;
          break;
        }
        // 对于其他 section，使用 -2vh 的容差
        if (scrollVh >= section.top - 2) {
          foundIndex = i;
          break;
        }
      }
      
      setCurrentSectionIndex(foundIndex);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll); // 监听窗口大小变化
    handleScroll(); // 初始检查
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [sections]);

  // 点击处理：滚动到下一个section或问题
  const handleClick = (e) => {
    // 阻止事件冒泡，确保点击事件被处理
    e.preventDefault();
    e.stopPropagation();
    
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const scrollVh = (scrollY / viewportHeight) * 100;
    
    // 检查是否在 GallerySection 中
    const galleryProgress = getGalleryProgress(scrollVh);
      const currentSection = sections[currentSectionIndex];
    const nextSectionIndex = currentSectionIndex + 1;
    
    console.log('[Gallery Section Debug]', {
      scrollVh: scrollVh.toFixed(1),
      galleryProgress: galleryProgress !== null ? galleryProgress.toFixed(3) : 'null',
      currentSection: currentSection?.name,
      currentSectionIndex
    });
    
    // 如果当前在 GallerySection 中（通过位置或 section 名称判断）
    if (galleryProgress !== null || currentSection?.name === 'gallery') {
      // 如果 galleryProgress 为 null，重新计算（可能因为边界问题）
      const actualGalleryProgress = galleryProgress !== null 
        ? galleryProgress 
        : (scrollVh >= 102 && scrollVh < 400) 
          ? (scrollVh - 102) / (400 - 102)
          : null;
      
      console.log('[Gallery Section] actualGalleryProgress:', actualGalleryProgress !== null ? actualGalleryProgress.toFixed(3) : 'null');
      
      if (actualGalleryProgress === null) {
        // 如果仍然无法计算，但 currentSection 是 gallery，强制滚动到 280vh
        const gallerySectionEnd = 280;
        const targetScrollY = (gallerySectionEnd / 100) * viewportHeight;
        
        console.log('[Gallery Section] Force scroll to 280vh (currentSection is gallery)');
        
        gsap.to(window, {
          scrollTo: { y: targetScrollY, autoKill: false },
          duration: 10.0, // 滚动到 280vh 使用 3 秒
          ease: "none" // 使用 linear 缓动
        });
        return;
      }
      
      // 280vh 对应的 progress = (280 - 102) / (400 - 102) ≈ 0.597
      const target280Progress = 0.597;
      
      // 如果还没到达 280vh（progress < 0.597），滚动到 280vh
      if (actualGalleryProgress < target280Progress - 0.05) { // 使用 0.05 的容差
        const gallerySectionEnd = 280;
        const targetScrollY = (gallerySectionEnd / 100) * viewportHeight;
        
        console.log('[Gallery Section] Scrolling to 280vh, current progress:', actualGalleryProgress.toFixed(3));
        
        gsap.to(window, {
          scrollTo: { y: targetScrollY, autoKill: false },
          duration: 10.0, // 滚动到 280vh 使用 10 秒
          ease: "none", // 使用 linear 缓动
          onComplete: () => {
            const finalScrollVh = (window.scrollY / window.innerHeight) * 100;
            console.log('[Gallery Section] Scroll to 280vh completed, final position:', finalScrollVh.toFixed(1) + 'vh');
          }
        });
        return;
      } else {
        // 已经在 280vh 附近，滚动到 ChartSection (400vh)
        console.log('[Gallery Section] At 280vh, scrolling to ChartSection (400vh), progress:', actualGalleryProgress.toFixed(3));
        if (nextSectionIndex < sections.length) {
          const nextSection = sections[nextSectionIndex];
          const targetScrollY = (nextSection.top / 100) * viewportHeight; // 400vh
          
          gsap.to(window, {
            scrollTo: { y: targetScrollY, autoKill: false },
            duration: 1.5,
            ease: "power2.inOut"
          });
        }
        return;
      }
    }
    
    // 检查是否在 QuestionSection 中
    const questionProgress = getQuestionProgress(scrollVh);
    
    // 如果当前在 question section 之前，但下一个 section 是 question
    if (currentSection?.name !== 'question' && nextSectionIndex < sections.length && sections[nextSectionIndex]?.name === 'question') {
      // 从其他 section 进入 question section，先跳转到 View 1
      const questionSection = sections[nextSectionIndex];
      const targetScrollY = (questionSection.top / 100) * viewportHeight; // 600vh
      
      gsap.to(window, {
        scrollTo: { y: targetScrollY, autoKill: false },
        duration: currentSection?.duration || 1.5,
        ease: currentSection?.ease || "power2.inOut"
      });
      return;
    }
    
    // 核心逻辑：只要在 QuestionSection 范围内（questionProgress !== null），就处理问题导航
    if (questionProgress !== null) {
      // 重新计算当前问题索引，确保准确性
      // 根据 QuestionSection.jsx 的显示逻辑：
      // Question 1: viewProgress < 0.43
      // Question 2: viewProgress >= 0.43 && < 0.56
      // Question 3: viewProgress >= 0.56 && < 0.69
      // Question 4: viewProgress >= 0.69
      let actualQuestionIndex = 0;
      if (questionProgress >= 0.69) {
        actualQuestionIndex = 4; // question4
      } else if (questionProgress >= 0.56) {
        actualQuestionIndex = 3; // question3
      } else if (questionProgress >= 0.43) {
        actualQuestionIndex = 2; // question2
      } else if (questionProgress >= 0.2) {
        actualQuestionIndex = 1; // question1
      } else {
        actualQuestionIndex = 0; // view1
      }
      
      const nextQuestionIndex = actualQuestionIndex + 1;
      
      // 诊断日志：只在 question 章节时显示
      console.log('[Question Section]', {
        scrollVh: scrollVh.toFixed(1),
        questionProgress: questionProgress.toFixed(3),
        currentQuestion: QUESTION_POSITIONS[actualQuestionIndex]?.name,
        actualQuestionIndex,
        nextQuestionIndex,
        totalQuestions: QUESTION_POSITIONS.length,
        willScrollToNext: nextQuestionIndex < QUESTION_POSITIONS.length
      });
      
      if (nextQuestionIndex < QUESTION_POSITIONS.length) {
        // 滚动到下一个问题
        const nextQuestion = QUESTION_POSITIONS[nextQuestionIndex];
        const targetScrollY = (nextQuestion.top / 100) * viewportHeight;
        
        // 检查当前位置是否已经在目标位置附近（避免重复滚动）
        const currentScrollY = window.scrollY;
        const distance = Math.abs(currentScrollY - targetScrollY);
        
        console.log('[Question Section] Scrolling to:', nextQuestion.name, 'at', nextQuestion.top + 'vh', 'current:', currentScrollY.toFixed(0), 'px, distance:', distance.toFixed(0), 'px');
        
        // 如果距离小于 50px，说明已经在目标位置，直接跳转到下一个问题
        if (distance < 50 && nextQuestionIndex + 1 < QUESTION_POSITIONS.length) {
          const nextNextQuestion = QUESTION_POSITIONS[nextQuestionIndex + 1];
          const nextTargetScrollY = (nextNextQuestion.top / 100) * viewportHeight;
          console.log('[Question Section] Already at target, skipping to next:', nextNextQuestion.name, 'at', nextNextQuestion.top + 'vh');
          
          gsap.to(window, {
            scrollTo: { y: nextTargetScrollY, autoKill: false },
            duration: 0.8, // question section 使用更快的动画
            ease: "power2.inOut"
          });
          return;
        }
        
        // 强制使用 GSAP 滚动，如果失败则使用原生滚动
        try {
          const animation = gsap.to(window, {
            scrollTo: { y: targetScrollY, autoKill: false },
            duration: 0.8, // question section 使用更快的动画
            ease: "power2.inOut"
          });
          
          if (!animation) {
            throw new Error('GSAP animation failed to create');
          }
          
          // 双重保险：如果 GSAP 没有立即执行，使用 setTimeout 作为 fallback
          setTimeout(() => {
            const currentScrollYAfter = window.scrollY;
            const distanceAfter = Math.abs(currentScrollYAfter - targetScrollY);
            if (distanceAfter > 50) {
              console.log('[Question Section] GSAP fallback triggered, distance:', distanceAfter);
              window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
            }
          }, 200);
        } catch (error) {
          console.error('[Question Section] GSAP scroll failed, using fallback:', error);
          window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        }
        
      } else {
        // 已经是最后一个问题，滚动到 EndingSection
        console.log('[Question Section] Last question, scrolling to EndingSection');
        if (nextSectionIndex < sections.length) {
          const nextSection = sections[nextSectionIndex];
          const targetScrollY = (nextSection.top / 100) * viewportHeight;
          
          gsap.to(window, {
            scrollTo: { y: targetScrollY, autoKill: false },
            duration: 0.8, // question section 使用更快的动画
            ease: "power2.inOut"
          });
        }
      }
      return;
    }
    
    // 不在 QuestionSection 中，正常滚动到下一个 section
    if (nextSectionIndex < sections.length) {
      const nextSection = sections[nextSectionIndex];
      const targetScrollY = (nextSection.top / 100) * viewportHeight;
      
      gsap.to(window, {
        scrollTo: { y: targetScrollY, autoKill: false },
        duration: currentSection?.duration || 1.5,
        ease: currentSection?.ease || "power2.inOut"
      });
    }
  };

  // 如果已经是最后一个section（video），隐藏按钮
  // 在 QuestionSection 中时，即使到达最后一个问题，按钮也会显示以便跳转到 EndingSection
  if (currentSectionIndex >= sections.length - 1) {
    return null;
  }


  return (
    <button
      onClick={handleClick}
      className="group fixed right-16 bottom-6 w-[80px] h-[160px] 
                 border border-white/20 bg-transparent 
                 flex flex-col items-center justify-between 
                 py-6 px-[16px] z-[1000] 
                 transition-all duration-500 ease-out
                 hover:border-white/50 
                 active:border-white/80 
                 cursor-pointer"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Next 文本 */}
      <div className="text-white text-[18px] font-semibold text-center tracking-none">
        Next
      </div>

      {/* 向下箭头图标（SVG） */}
      <img
        src="/images/arrow-next.svg"
        alt="Next"
        className="w-8 h-8 mt-2 transition-transform duration-500 ease-out group-hover:translate-y-2"
      />

      {/* 底部分隔线 */}
      <div className="absolute bottom-0 w-full h-[1px] group-hover:h-[4px] bg-white transition-all duration-500 ease-out" />
    </button>
  );
}
