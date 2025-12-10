 "use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
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
import Section10 from "./components/Section10";
import Section11 from "./components/Section11";
import GlobalCanvasContainer from "./components/GlobalCanvasContainer";
import NavigationBar from "./components/NavigationBar";

// Define scroll position configuration
const SCROLL_POSITIONS = [
  { type: 'section', id: 1 },
  { type: 'section', id: 2 },
  { type: 'section', id: 3 },
  { type: 'section', id: 4 },
  { type: 'section5-vh', vh: 1 },
  { type: 'section5-vh', vh: 211 },
  { type: 'section5-vh', vh: 399 },
  { type: 'section5-vh', vh: 600 },
  { type: 'section5-vh', vh: 700 },
  { type: 'section5-vh', vh: 800 },
  { type: 'section5-vh', vh: 900 },
  { type: 'section5-vh', vh: 1000 },
  { type: 'section5-vh', vh: 1100 },
  { type: 'section5-vh', vh: 1200 },
  { type: 'section', id: 6 },
  { type: 'section', id: 7 },
  { type: 'section', id: 8 },
  { type: 'section', id: 9 },
  { type: 'section', id: 10 },
  { type: 'section10-vh', vh: 100 },
  { type: 'section11-end' },
];

// Define scroll duration for each position (in milliseconds)
const SCROLL_DURATIONS = [
  500, // Section 1 -> 2
  500, // Section 2 -> 3
  500, // Section 3 -> 4
  500, // Section 4 -> Section 5 vh=1
  2000, // Section 5 vh=1 -> vh=211
  2000, // Section 5 vh=211 -> vh=399
  1000, // Section 5 vh=399 -> vh=600
  1000, // Section 5 vh=600 -> vh=700
  1000, // Section 5 vh=700 -> vh=800
  1000, // Section 5 vh=800 -> vh=900
  1000, // Section 5 vh=900 -> vh=1000
  1000, // Section 5 vh=1000 -> vh=1100
  1000, // Section 5 vh=1100 -> vh=1200
  500, // Section 5 vh=1200 -> Section 6
  500, // Section 6 -> Section 7
  500, // Section 7 -> Section 8
  500, // Section 8 -> Section 9
  500, // Section 9 -> Section 10
  2000, // Section 10 -> Section 10 (100vh)
  2000, // Section 10 (100vh) -> Section 11 (end)
];

export default function VBTestPage() {
  // Check URL parameter and sessionStorage immediately during initial render to prevent flash
  const [shouldHideContent, setShouldHideContent] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSection8 = urlParams.get('section') === '8';
      const sessionSection8 = sessionStorage.getItem('vb-return-section') === '8';
      const showOverlay = sessionStorage.getItem('vb-show-overlay') === 'true';
      // Return true if URL parameter or sessionStorage indicates we should show overlay
      return urlSection8 || (sessionSection8 && showOverlay);
    }
    return false;
  });
  
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollProgress8, setScrollProgress8] = useState(0);
  const [activeSection, setActiveSection] = useState(null); // 'section5' | 'section8' | null
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showEYLogo, setShowEYLogo] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false); // Control fade-out animation
  const scrollSectionRef = useRef(null);
  const scrollSectionRef8 = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const section6Ref = useRef(null);
  const section7Ref = useRef(null);
  const section8Ref = useRef(null);
  const section9Ref = useRef(null);
  const section10Ref = useRef(null);
  const section11Ref = useRef(null);
  
  // Layer information configuration
  const layerInfo = [
    {
      title: 'System of Record',
      description: 'Expose sources of truth through reliable connectors for agent and human interaction.',
    },
    {
      title: 'AI-Native Platform',
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
      title: 'Customer',
      description: "Leverage EY's venture-building expertise to create new experiences, products, and business models.",
    },
  ];
  
  // Register ScrollTrigger plugin and initialize mounted state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }, []);

  // Check URL parameter early and set initial scroll position before first render
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    // If we detected section=8 in initial state, hide body overflow immediately
    if (shouldHideContent) {
      document.body.style.overflow = 'hidden';
      // Clear URL parameter and sessionStorage immediately
      window.history.replaceState({}, '', '/value-blueprints');
      sessionStorage.removeItem('vb-return-section');
      sessionStorage.removeItem('vb-show-overlay');
    }
    
    setMounted(true);
    
    // Cleanup function: ensure page scroll is restored when component unmounts
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [shouldHideContent]);

  // Update position index based on current scroll position
  useEffect(() => {
    if (!mounted || isScrolling || typeof window === 'undefined') return;

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
            4: section4Ref,
            6: section6Ref,
            7: section7Ref,
            8: section8Ref,
            9: section9Ref,
            10: section10Ref,
          };
          const ref = sectionRefs[position.id];
          if (ref?.current) {
            targetY = ref.current.offsetTop;
          }
        } else if (position.type === 'section5-vh') {
          // Use the same calculation logic as calculateScrollTarget
          // Note: For layers display stage (600vh+), actual scroll position may be +2vh, but detection should be based on original vh
          if (scrollSectionRef.current) {
            const trigger = ScrollTrigger.getById('section5-trigger');
            if (trigger) {
              const startScrollY = trigger.start;
              const endScrollY = trigger.end;
              const section5Height = 1300 * viewportHeight / 100;
              const scrollRange = section5Height - viewportHeight;
              const targetProgress = position.vh / 1300;
              targetY = startScrollY + targetProgress * scrollRange;
            } else {
              // Fallback: if trigger hasn't been created yet
              const section5Top = scrollSectionRef.current.offsetTop;
              const section5Height = 1300 * viewportHeight / 100;
              const scrollRange = section5Height - viewportHeight;
              const targetProgress = position.vh / 1300;
              targetY = section5Top + targetProgress * scrollRange;
            }
          }
        } else if (position.type === 'section8-vh') {
          if (scrollSectionRef8.current) {
            const section8Top = scrollSectionRef8.current.offsetTop;
            const vhInPixels = (position.vh / 100) * viewportHeight;
            targetY = section8Top + vhInPixels;
          }
        } else if (position.type === 'section10-vh') {
          if (section10Ref?.current) {
            const section10Top = section10Ref.current.offsetTop;
            const vhInPixels = (position.vh / 100) * viewportHeight;
            targetY = section10Top + vhInPixels;
          }
        } else if (position.type === 'section11-end') {
          if (scrollSectionRef8.current) {
            // Section11 uses scrollSectionRef8, and it's 300vh tall
            const section11Top = scrollSectionRef8.current.offsetTop;
            const section11Height = 300 * viewportHeight / 100;
            targetY = section11Top + section11Height - viewportHeight;
          }
        }

        // For layers display stage (600vh+), allow ±2vh tolerance because scroll target position will be +2vh
        let distance = Math.abs(scrollY - targetY);
        if (position.type === 'section5-vh' && position.vh >= 600) {
          // Check if within ±2vh range (corresponding to actual scroll position +2vh case)
          const vh2Offset = (2 / 100) * viewportHeight;
          distance = Math.min(distance, Math.abs(scrollY - (targetY + vh2Offset)));
        }
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
      if (!ticking && typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          updateCurrentPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [mounted, isScrolling]);

  // Calculate scroll target position - use useCallback for optimization, avoid recreating on each render
  const calculateScrollTarget = useCallback((positionIndex) => {
    if (typeof window === 'undefined') return null;
    
    const position = SCROLL_POSITIONS[positionIndex];
    if (!position) return null;

    if (position.type === 'section') {
      // Regular section, scroll to section top
      const sectionRefs = {
        1: section1Ref,
        2: section2Ref,
        3: section3Ref,
        4: section4Ref,
        6: section6Ref,
        7: section7Ref,
        8: section8Ref,
        9: section9Ref,
        10: section10Ref,
      };
      const ref = sectionRefs[position.id];
      if (ref?.current) {
        return {
          element: ref.current,
          offset: ref.current.offsetTop,
        };
      }
    } else if (position.type === 'section5-vh') {
      // Section5 specific vh position
      // ScrollTrigger: start="top top", end="bottom bottom"
      // progress = (scrollY - startScrollY) / (endScrollY - startScrollY)
      // To make progress = vh / 1300, need to correctly calculate start and end positions
      // For layers display stage (600vh+), scroll target position should be +2vh
      if (scrollSectionRef.current) {
        const trigger = ScrollTrigger.getById('section5-trigger');
        // If it's layers display stage (600vh and above), scroll target +2vh
        const targetVh = position.vh >= 600 ? position.vh + 2 : position.vh;
        
        if (trigger) {
          // Use ScrollTrigger's actual start and end positions
          const startScrollY = trigger.start;
          const endScrollY = trigger.end;
          const section5Height = 1300 * window.innerHeight / 100;
          const viewportHeight = window.innerHeight;
          const scrollRange = section5Height - viewportHeight;
          const targetProgress = targetVh / 1300;
          const targetScrollY = startScrollY + targetProgress * scrollRange;
          
          return {
            element: scrollSectionRef.current,
            offset: targetScrollY,
          };
        } else {
          // If trigger hasn't been created yet, use simple calculation
          const section5Top = scrollSectionRef.current.offsetTop;
          const section5Height = 1300 * window.innerHeight / 100;
          const viewportHeight = window.innerHeight;
          const scrollRange = section5Height - viewportHeight;
          const targetProgress = targetVh / 1300;
          const targetScrollY = section5Top + targetProgress * scrollRange;
          
          return {
            element: scrollSectionRef.current,
            offset: targetScrollY,
          };
        }
      }
    } else if (position.type === 'section8-vh') {
      // Section8 specific vh position
      if (scrollSectionRef8.current) {
        const section8Top = scrollSectionRef8.current.offsetTop;
        const vhInPixels = (position.vh / 100) * window.innerHeight;
        return {
          element: scrollSectionRef8.current,
          offset: section8Top + vhInPixels,
        };
      }
    } else if (position.type === 'section10-vh') {
      // Section10 specific vh position
      if (section10Ref?.current) {
        const section10Top = section10Ref.current.offsetTop;
        const vhInPixels = (position.vh / 100) * window.innerHeight;
        return {
          element: section10Ref.current,
          offset: section10Top + vhInPixels,
        };
      }
    } else if (position.type === 'section11-end') {
      // Section11 end position (scroll to bottom of section11)
      if (scrollSectionRef8.current) {
        // Section11 uses scrollSectionRef8, and it's 300vh tall
        const section11Top = scrollSectionRef8.current.offsetTop;
        const section11Height = 300 * window.innerHeight / 100;
        const viewportHeight = window.innerHeight;
        // Scroll to bottom of section11, accounting for viewport height
        const targetScrollY = section11Top + section11Height - viewportHeight;
        return {
          element: scrollSectionRef8.current,
          offset: targetScrollY,
        };
      }
    }
    return null;
  }, [scrollSectionRef, scrollSectionRef8, section1Ref, section2Ref, section3Ref, section4Ref, section6Ref, section7Ref, section8Ref, section9Ref, section10Ref]);

  // Navigate to specified position
  const handleNavigate = (targetIndex) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
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
    // SCROLL_DURATIONS corresponds to duration from current position to next position
    // Select correct duration index based on direction
    const isForward = targetIndex > sourceIndex;
    const stepIndex = isForward ? sourceIndex : targetIndex;
    const duration = stepIndex >= 0 && stepIndex < SCROLL_DURATIONS.length 
      ? SCROLL_DURATIONS[stepIndex] 
      : 500;

    // Disable page scrolling (prevent user manual scrolling from interfering with animation)
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
      if (typeof window !== 'undefined') {
        window.scrollTo(0, currentY);
      }

      if (progress < 1) {
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
          requestAnimationFrame(animateScroll);
        }
      } else {
        // Ensure final position is accurate
        if (typeof window !== 'undefined') {
          window.scrollTo(0, targetY);
        }
        // Restore page scrolling
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
        }
        setIsScrolling(false);
        // Force update current position index to ensure navigation bar displays correctly
        setCurrentPositionIndex(targetIndex);
      }
    };

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      requestAnimationFrame(animateScroll);
    }
  };
  
  // Handle URL parameter to jump to Section 8 when returning from success story
  useEffect(() => {
    if (!mounted || !shouldHideContent || typeof window === 'undefined' || typeof document === 'undefined') return;
    
    // Clear sessionStorage if used
    sessionStorage.removeItem('vb-return-section');
    sessionStorage.removeItem('vb-show-overlay');
    
    // Wait for page to fully render and refs to be ready, then jump to Section 8
    const attemptScroll = (retries = 15) => {
      if (retries <= 0) {
        console.warn('Failed to scroll to Section 8: refs not ready');
        if (typeof document !== 'undefined') {
          document.body.style.overflow = ''; // Restore overflow if failed
        }
        setIsFadingOut(true);
        setTimeout(() => {
          setShouldHideContent(false); // Completely remove overlay
          setIsFadingOut(false);
        }, 300);
        return;
      }
      
      // Check if section8Ref is ready
      if (!section8Ref.current) {
        setTimeout(() => attemptScroll(retries - 1), 50);
        return;
      }
      
      // Section 8 index in SCROLL_POSITIONS array is 16
      // Index calculation: 0-3 (sections 1-4) + 4-13 (section5 vh positions) + 14 (section 6) + 15 (section 7) + 16 (section 8)
      const targetIndex = 16;
      const target = calculateScrollTarget(targetIndex);
      
      if (target && target.offset !== undefined && target.offset > 0) {
        // Direct positioning, no animation
        window.scrollTo({
          top: target.offset,
          behavior: 'auto' // Ensure no animation
        });
        setCurrentPositionIndex(targetIndex);
        
        // Ensure overlay displays for at least 500ms, then fade out
        const startTime = Date.now();
        const minDisplayTime = 500; // Minimum display time 500ms
        
        const checkAndFade = () => {
          const elapsed = Date.now() - startTime;
          if (elapsed >= minDisplayTime) {
            // Start fade out
            setIsFadingOut(true);
            // Restore overflow and hide overlay after fade-out animation completes
            setTimeout(() => {
              if (typeof document !== 'undefined') {
                document.body.style.overflow = '';
              }
              setShouldHideContent(false); // Completely remove overlay
              setIsFadingOut(false);
            }, 300); // Fade-out animation duration 300ms
          } else {
            // If not yet 500ms, continue waiting
            setTimeout(checkAndFade, minDisplayTime - elapsed);
          }
        };
        
        checkAndFade();
      } else {
        // If calculateScrollTarget failed, try again
        setTimeout(() => attemptScroll(retries - 1), 50);
      }
    };
    
    // Start attempting scroll immediately (no delay to prevent flash)
    // Use requestAnimationFrame to ensure DOM is ready
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      requestAnimationFrame(() => {
        attemptScroll();
      });
    } else {
      // Fallback for environments without requestAnimationFrame
      setTimeout(() => {
        attemptScroll();
      }, 0);
    }
  }, [mounted, calculateScrollTarget, section8Ref]);
  
  // Set up scroll triggers (control scroll range for 3D section)
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    // Section5 ScrollTrigger
    const trigger = ScrollTrigger.create({
      id: 'section5-trigger',
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
        // Only clear when before entering Section8
        if (!scrollSectionRef8.current) return;
        const rect8 = scrollSectionRef8.current.getBoundingClientRect();
        if (rect8.top > window.innerHeight) {
          setActiveSection(null);
        }
      },
      onEnterBack: () => setActiveSection('section5'),
      onLeaveBack: () => setActiveSection(null),
    });
    
    // Section8 ScrollTrigger
    // start: "top bottom" means when section8's top enters viewport bottom, start calculation (progress = 0)
    // end: "bottom bottom" means when section8's bottom reaches viewport bottom, end (progress = 1)
    // This way from entering screen to completely scrolling past is exactly 300vh scroll distance (section8 height)
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
          // If already scrolled to end of section8 (progress = 1), keep section8 active
          setActiveSection('section8');
        }
      },
      onEnter: () => setActiveSection('section8'),
      onLeave: () => {
        // Only set when truly leaving section8 area (check if section8 is still in viewport)
        if (scrollSectionRef8.current) {
          const rect8 = scrollSectionRef8.current.getBoundingClientRect();
          // If section8 completely leaves viewport (bottom above viewport top), set to null
          if (rect8.bottom < 0) {
            setActiveSection(null);
          } else {
            // Otherwise keep section8 active (stay at final stage)
            setActiveSection('section8');
          }
        }
      },
      onEnterBack: () => setActiveSection('section8'),
      onLeaveBack: () => {
        // If leaving Section8 back to Section5, keep Section5 active
        const rect5 = scrollSectionRef.current?.getBoundingClientRect();
        if (rect5 && rect5.top <= window.innerHeight && rect5.bottom > 0) {
          setActiveSection('section5');
        } else {
          // Otherwise keep section8 active (stay at final stage when scrolling up)
          setActiveSection('section8');
        }
      },
    });
    
    return () => {
      trigger.kill();
      trigger8.kill();
    };
  }, [mounted]);

  // Listen to scroll, control EY logo show/hide
  useEffect(() => {
    if (!mounted || !section1Ref.current || typeof window === 'undefined') return;

    const checkScrollPosition = () => {
      if (section1Ref.current && typeof window !== 'undefined') {
        const section1Bottom = section1Ref.current.offsetTop + section1Ref.current.offsetHeight;
        const scrollY = window.scrollY || window.pageYOffset;
        setShowEYLogo(scrollY > section1Bottom);
      }
    };

    // Initial check
    checkScrollPosition();

    // Listen to scroll events
    let ticking = false;
    const handleScroll = () => {
      if (!ticking && typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          checkScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [mounted]);

  return (
    <>
      {/* Hide content overlay - render FIRST to prevent flash when returning from success story */}
      {shouldHideContent && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#1F1E27',
            zIndex: 99999,
            pointerEvents: 'none',
            opacity: isFadingOut ? 0 : 1,
            transition: isFadingOut ? 'opacity 300ms ease-out' : 'none', // Only transition on fade-out, not initial display
            willChange: 'opacity' // Optimize for opacity changes
          }}
        />
      )}

      {/* Global Canvas container - fixed positioning, switch content based on activeSection */}
      <GlobalCanvasContainer
        activeSection={activeSection}
        scrollProgress5={scrollProgress}
        scrollProgress8={scrollProgress8}
        mounted={mounted}
        layerInfo={layerInfo}
      />

      {/* Fixed EY Logo - show when outside section1 */}
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
        <Section7 />
      </div>
      <div ref={section8Ref}>
        <Section8 />
      </div>
      <div ref={section9Ref}>
        <Section9 />
      </div>
      <div ref={section10Ref}>
        <Section10 />
      </div>
      <Section11
        scrollSectionRef={scrollSectionRef8}
      />

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
            section4: section4Ref,
            section5: scrollSectionRef,
            section6: section6Ref,
            section7: section7Ref,
            section8: section8Ref,
            section9: section9Ref,
            section10: section10Ref,
            section11: scrollSectionRef8,
          }}
        />
      )}
    </>
  );
}
