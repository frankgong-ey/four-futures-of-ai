"use client";

import React, { useMemo, useRef } from "react";

// FourthSection组件 - 500vh高度，分为5个views
export default function FourthSection({ sectionRef, viewProgress = 0 }) {
  return (
    <div 
      ref={sectionRef}
      className="relative w-full h-[500vh] bg-transparent"
    >
      {/* View 1 - 深色背景，参考图设计 */}
      <div className="h-screen bg-transparent flex items-center justify-center px-[16px] md:px-[64px] sm:px-[16px]">
        <div className="grid grid-cols-12 gap-[24px] w-full max-w-7xl">
          {/* 文字内容占据中间 8 列 */}
          <div className="col-span-8 col-start-3 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-none">
              But with <span className="text-[#28C5E7] relative">
                foresight
                {/* 蓝色光束效果 */}
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
        
        {/* T字形辅助线 - 绝对定位在标题下方 */}
        <div className="absolute top-[13%] left-1/2 transform -translate-x-1/2 z-10">
          {/* 横线 */}
          <div className="w-[800px] h-[1px] bg-white/20"></div>
          {/* 竖线 */}
          <div className="w-[1px] h-[435vh] bg-white/20 mx-auto"></div>
        </div>
      </div>

      {/* Views 2-5 合并 - 400vh高度 */}
      <div className="h-[400vh] bg-transparent">
            {/* 内容可以在这里添加 */}
            <div className="sticky top-[240px] left-0 right-0 px-[16px] md:px-[64px] sm:px-[16px] z-10">
                <div className="grid grid-cols-12 gap-[24px]">
                        {/* 标题占据右侧 9-12 列 */}
                        <div className="col-span-4 col-start-1 flex flex-col gap-[16px] items-start">
                            <h2 className="text-4xl md:text-[80px] sm:text-3xl leading-none text-transparent"  style={{WebkitTextStroke: '1px white'}}>
                                By 2030
                            </h2>
                        </div>

                        {/* 标题占据右侧 9-12 列 */}
                        <div className="col-span-5 col-start-1 flex flex-col gap-[16px] items-start">
                            <h2 className="text-4xl md:text-[80px] sm:text-3xl leading-none text-white">
                            {viewProgress < 0.25 && (
                                <>Will AI progress be defined by breakdowns or breakthroughs?</>
                            )}
                            {viewProgress >= 0.25 && viewProgress < 0.5 && (
                                <>Will AI progress be controlled by the many or the few?</>
                            )}
                            {viewProgress >= 0.5 && viewProgress < 0.75 && (
                                <>Will AI progress be rapid or stagnate?</>
                            )}
                            {viewProgress >= 0.75 && (
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
