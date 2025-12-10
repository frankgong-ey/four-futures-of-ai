"use client";

import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Section1 from "./components/Section1";
import Section2 from "./components/Section2";
import Section3 from "./components/Section3";
import Section4 from "./components/Section4";
import NavigationBar from "./components/NavigationBar";
import { storiesData, defaultStoryId } from "./data/storiesData";

// Define scroll position configuration
const SCROLL_POSITIONS = [
  { type: 'section', id: 1 },
  { type: 'section', id: 2 },
  { type: 'section', id: 3 },
];

// Define scroll duration for each position (in milliseconds)
const SCROLL_DURATIONS = [
  500, // Section 1 -> 2
  500, // Section 2 -> 3
];

function SuccessStoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client') || defaultStoryId;
  const storyData = storiesData[clientId] || storiesData[defaultStoryId];
  
  const [mounted, setMounted] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  
  const handleBack = () => {
    // 先设置 sessionStorage 标记，确保遮罩能及时显示
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('vb-return-section', '8');
      sessionStorage.setItem('vb-show-overlay', 'true');
    }
    
    // 返回时跳转到 /value-blueprints，并带上 section=8 参数
    router.push('/value-blueprints?section=8');
  };
  
  const handleMoreStoryClick = (storyId) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('vb-return-section', '8');
    }
    router.push(`/value-blueprints/success-story?client=${storyId}`);
  };
  
  // 确保页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
  }, []);

  // Update position index based on current scroll position
  useEffect(() => {
    if (!mounted || isScrolling) return;

    const updateCurrentPosition = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;

      // Check each position to find the closest to current position
      let closestIndex = 0;
      let closestDistance = Infinity;

      SCROLL_POSITIONS.forEach((position, index) => {
        let targetY = 0;

        if (position.type === 'section') {
          const sectionRefs = {
            1: section1Ref,
            2: section2Ref,
            3: section3Ref,
          };
          const ref = sectionRefs[position.id];
          if (ref?.current) {
            targetY = ref.current.offsetTop;
          }
        }

        const distance = Math.abs(scrollY - targetY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Only update when distance is close enough (to avoid frequent updates)
      if (closestDistance < viewportHeight * 0.5) {
        setCurrentPositionIndex(closestIndex);
      }
    };

    // Initial update
    updateCurrentPosition();

    // Listen to scroll events (with throttling)
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

  // Calculate scroll target position
  const calculateScrollTarget = useCallback((positionIndex) => {
    const position = SCROLL_POSITIONS[positionIndex];
    if (!position) return null;

    if (position.type === 'section') {
      const sectionRefs = {
        1: section1Ref,
        2: section2Ref,
        3: section3Ref,
      };
      const ref = sectionRefs[position.id];
      if (ref?.current) {
        return {
          element: ref.current,
          offset: ref.current.offsetTop,
        };
      }
    }
    return null;
  }, []);

  // Navigate to specified position
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

    // Get scroll duration
    const isForward = targetIndex > sourceIndex;
    const stepIndex = isForward ? sourceIndex : targetIndex;
    const duration = stepIndex >= 0 && stepIndex < SCROLL_DURATIONS.length 
      ? SCROLL_DURATIONS[stepIndex] 
      : 500;

    // Disable page scrolling
    document.body.style.overflow = 'hidden';

    // Get current scroll position
    const startY = window.scrollY || window.pageYOffset;
    const targetY = target.offset;
    const distance = targetY - startY;
    const startTime = performance.now();

    // Use requestAnimationFrame to implement smooth scrolling
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeInOut easing function
      const easeInOut = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentY = startY + distance * easeInOut;
      window.scrollTo(0, currentY);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Ensure final position is accurate
        window.scrollTo(0, targetY);
        // Restore page scrolling
        document.body.style.overflow = '';
        setIsScrolling(false);
        // Force update current position index
        setCurrentPositionIndex(targetIndex);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <div className="relative w-full text-white bg-black" style={{ fontFamily: 'var(--font-eyinterstate)' }}>
      <div ref={section1Ref}>
        <Section1 storyData={storyData} />
      </div>
      <div ref={section2Ref}>
        <Section2 storyData={storyData} />
      </div>
      <div ref={section3Ref}>
        <Section3 storyData={storyData} />
      </div>
      <Section4 onBack={handleBack} onMoreStoryClick={handleMoreStoryClick} />
      
      {/* Navigation bar */}
      {mounted && (
        <NavigationBar
          onNavigate={handleNavigate}
          currentPositionIndex={currentPositionIndex}
          isScrolling={isScrolling}
          sectionRefs={{
            section1: section1Ref,
            section2: section2Ref,
            section3: section3Ref,
          }}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default function SuccessStoryRoute() {
  return (
    <Suspense fallback={<div className="relative w-full text-white bg-black min-h-screen flex items-center justify-center" style={{ fontFamily: 'var(--font-eyinterstate)' }}>Loading...</div>}>
      <SuccessStoryContent />
    </Suspense>
  );
}

