"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

// QuestionSection - 500vh total height, split into 100vh + 400vh
export default function QuestionSection() {
  // Local refs
  const sectionRef = useRef(null);
  
  // Internal state for view progress
  const [viewProgress, setViewProgress] = React.useState(0);

  // ScrollTrigger management - self-contained timeline
  useEffect(() => {
    if (!sectionRef.current) return;

    // Create ScrollTrigger to manage progress and animations
    const trigger = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          setViewProgress(progress);
        }
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative w-full h-[500vh] bg-transparent"
    >
      {/* View 1 - dark background as per reference design */}
      <div className="h-screen bg-transparent flex items-center justify-center px-[16px] md:px-[64px] sm:px-[16px]">
        <div className="grid grid-cols-12 gap-[24px] w-full max-w-7xl">
          {/* Text in the center 8 columns */}
          <div className="col-span-8 col-start-3 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-none">
              But with <span className="text-[#FFE600] relative">
                foresight
                {/* Blue beam effect (commented) */}
                {/* <div className="absolute -top-4 -right-4 w-32 h-16 bg-gradient-to-r from-blue-400/60 to-transparent transform rotate-12 blur-sm"></div>
                <div className="absolute -top-2 -right-2 w-24 h-12 bg-gradient-to-r from-blue-400/80 to-transparent transform rotate-12 blur-sm"></div>
                <div className="absolute -top-1 -right-1 w-16 h-8 bg-gradient-to-r from-blue-400 to-transparent transform rotate-12 blur-sm"></div> */}
              </span>, we
              <br />
              can be ready for
              <br />
              whatever comes next.
            </h1>
          </div>
        </div>
        
        {/* T-shape guides - absolute below the title */}
        <div className="absolute top-[13%] left-1/2 transform -translate-x-1/2 z-10">
          {/* Horizontal line */}
          <div className="w-[800px] h-[1px] bg-white/20"></div>
          {/* Vertical line */}
          <div className="w-[1px] h-[435vh] bg-white/20 mx-auto"></div>
        </div>
      </div>

      {/* Views 2-5 combined - 400vh height */}
      <div className="h-[400vh] bg-transparent">
            {/* Content can be added here */}
            <div className="sticky top-[240px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-10">
                <div className="grid grid-cols-12 gap-[24px]">
                        {/* Title block */}
                        <div className="col-span-4 col-start-1 flex flex-col gap-[16px] items-start">
                            <h2 className="text-4xl md:text-[80px] sm:text-3xl leading-none text-transparent"  style={{WebkitTextStroke: '1px white'}}>
                                By 2030
                            </h2>
                        </div>

                        {/* Title block */}
                        <div className="col-span-5 col-start-1 flex flex-col gap-[16px] items-start">
                            <h2 className="text-4xl md:text-[80px] sm:text-3xl leading-none text-white">
                            {viewProgress < 0.43 && (
                                <>Will AI progress be defined by breakdowns or breakthroughs?</>
                            )}
                            {viewProgress >= 0.43 && viewProgress < 0.56 && (
                                <>Will AI progress be controlled by the many or the few?</>
                            )}
                            {viewProgress >= 0.56 && viewProgress < 0.69 && (
                                <>Will AI progress be rapid or stagnate?</>
                            )}
                            {viewProgress >= 0.69 && (
                                <>Will AI manage people or people manage AI?</>
                            )}
                            </h2>
                        </div>

                </div>
            </div>
      </div>
    </div>
  );
}
