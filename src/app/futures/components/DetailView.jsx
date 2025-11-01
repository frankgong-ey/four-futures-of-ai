"use client";

import React, { useState, useRef, useEffect } from "react";

export default function DetailView({ future, onClose }) {
  const [activeSection, setActiveSection] = useState("about");
  const contentRef = useRef(null);

  // 阻止背景页面滚动
  useEffect(() => {
    // 通知 3D Canvas 暂停渲染
    try {
      window.dispatchEvent(new CustomEvent('detailview-open'));
    } catch (e) {}

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      // 通知 3D Canvas 恢复渲染
      try {
        window.dispatchEvent(new CustomEvent('detailview-close'));
      } catch (e) {}
    };
  }, []);

  // 简化版本判定：All-Industry 与 Sectorized 两类
  const isSectorized = (future?.id && future.id.includes('-')) || !!future?.content?.valueChainImpacts;

  // 动态生成 sections，仅按两类结构输出
  const sections = React.useMemo(() => {
    const list = [{ id: "about", title: future?.content?.about?.title || "About This Future" }];
    if (isSectorized) {
      if (future?.content?.valueChainImpacts) list.push({ id: "valueChainImpacts", title: future.content.valueChainImpacts.title });
      if (future?.content?.strategicResponse) list.push({ id: "strategicResponse", title: future.content.strategicResponse.title });
    } else {
      if (future?.content?.forces) list.push({ id: "forces", title: future.content.forces.title });
      if (future?.content?.strategicPlays) list.push({ id: "strategicPlays", title: future.content.strategicPlays.title });
    }
    return list;
  }, [isSectorized, future?.content]);

  // 滚动到指定section
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element && contentRef.current) {
        const elementTop = element.offsetTop - 64; // 64px距离顶部
        contentRef.current.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  // 监听滚动，更新active section
  useEffect(() => {
    let timeoutId = null;

    const handleScroll = () => {
      if (!contentRef.current) return;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const scrollTop = contentRef.current.scrollTop;
        const threshold = scrollTop + 200; // 触发偏移
        
        // 找到当前滚动位置经过的最后一个section（考虑64px偏移）
        let currentSection = sections[0].id;
        
        sections.forEach((section) => {
          const element = document.getElementById(section.id);
          if (element) {
            const sectionTop = element.offsetTop - 64; // 减去64px偏移
            if (sectionTop <= threshold) {
              currentSection = section.id;
            }
          }
        });

        setActiveSection(currentSection);
      }, 50);
    };

    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => {
        content.removeEventListener('scroll', handleScroll);
        clearTimeout(timeoutId);
      };
    }
  }, [sections]);

  return (
    <>
      {/* 背景遮罩（移除 backdrop-blur 以降低合成成本） */}
      <div className="fixed inset-0 bg-black/95 z-[99]"></div>
      
      {/* Modal 内容（添加 isolate 创建独立 stacking context） */}
      <div className="fixed inset-0 text-white flex z-[100] isolate">
        {/* 左侧导航 */}
        <div className="fixed left-0 top-0 w-96 bg-transparent border-r border-white/10 z-[101] h-full overflow-hidden pointer-events-none">
        <div className="p-8 h-full flex flex-col pointer-events-auto">
          {/* Close按钮 - 带白色圆圈 */}
          <button
            onClick={onClose}
            className="mb-12 mt-8 flex items-center gap-3 text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full border border-white flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="font-medium">Close</span>
          </button>

          {/* 标题 */}
          <div className="mb-16">
            <h1 
              className="text-5xl font-bold mb-4 leading-tight break-words"
              style={{
                background: `linear-gradient(to right, #FFFFFF, ${future.color})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.05em'
              }}
            >
              {future.title}
            </h1>
            <p className="text-white/70 leading-relaxed text-sm">
              {future.description}
            </p>
          </div>

          {/* 导航菜单 - Anchored Links */}
          <nav className="flex-1">
            <div className="relative pl-4">
              {/* 轨道 */}
              <div 
                className="absolute left-0 w-px bg-white/30"
                style={{
                  top: '0px',
                  height: `${48 * 3}px`
                }}
              />
              
              {/* 滑块 */}
              <div 
                className="absolute left-0 w-1 bg-white transition-all duration-300 ease-out -ml-1"
                style={{
                  top: `${sections.findIndex(s => s.id === activeSection) * 48}px`,
                  height: '48px'
                }}
              />
              
              <ul className="relative">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        scrollToSection(section.id);
                      }}
                      className={`w-full text-left pl-2 py-3 relative transition-all cursor-pointer pointer-events-auto ${
                        activeSection === section.id
                          ? 'text-white'
                          : 'text-white/50 hover:text-white'
                      }`}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <span className="block font-medium">{section.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* 滚动提示 */}
          <div className="text-center text-white/40 text-xs">
            <div className="mb-2">Scroll down to explore</div>
            <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* 右侧内容 - 可滚动 */}
      <div className="fixed right-0 top-0 w-[calc(100%-24rem)] h-full overflow-hidden z-[101]">
        <div 
          ref={contentRef}
          className="h-full overflow-y-auto will-change-transform detail-scroll"
        >
          <div className="max-w-4xl mx-auto px-8 pt-16 pb-160 space-y-8">
            {/* About Section */}
            <section id="about" data-section>
              <div className="bg-white/10 backdrop-blur-lg p-8 outline outline-1 outline-white/20">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {future.content.about.title || "About This Future"}
                </h2>
                
                {future.content.about.subtitle && (
                  <h3 className="text-2xl font-semibold text-white/90 mb-6">
                    {future.content.about.subtitle}
                  </h3>
                )}
                
                <div className="text-lg leading-relaxed text-white/80 mb-12 space-y-4">
                  {Array.isArray(future.content.about.description) ? (
                    future.content.about.description.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))
                  ) : (
                    <p>{future.content.about.description}</p>
                  )}
                </div>
                
                {/* 视频部分 - All-Industry 才显示（sectorized 不显示） */}
                {!isSectorized && future.content.about.video && !future.content.about.hideVideo && (
                  <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                    <img 
                      src={future.content.about.video.thumbnail}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <button className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                        <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 两类版本渲染：Sectorized vs All-Industry */}
            {isSectorized ? (
              <>
                {future.content.valueChainImpacts && (
                  <section id="valueChainImpacts" data-section>
                    <div className="bg-white/10 backdrop-blur-lg p-8 outline outline-1 outline-white/20">
                      <h2 className="text-3xl font-bold text-white mb-12">{future.content.valueChainImpacts.title}</h2>
                      <div className="space-y-6">
                        {future.content.valueChainImpacts.items.map((item, index) => (
                          <div key={index} className="flex items-start gap-6">
                            <div className="flex-shrink-0 w-14 h-14 bg-white/5 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white text-xl font-semibold mb-2">{item.title}</h3>
                              <p className="text-white/70 text-base leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {future.content.strategicResponse && (
                  <section id="strategicResponse" data-section>
                    <div className="bg-white/10 backdrop-blur-lg p-8 outline outline-1 outline-white/20">
                      <h2 className="text-3xl font-bold text-white mb-6">{future.content.strategicResponse.title}</h2>
                      {future.content.strategicResponse.description && (
                        <p className="text-white/80 text-base leading-relaxed mb-8">{future.content.strategicResponse.description}</p>
                      )}
                      <div className="space-y-6">
                        {future.content.strategicResponse.items.map((play, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <p className="text-white/80 text-lg leading-relaxed pt-1">{play}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </>
            ) : (
              <>
                {future.content.forces && (
                  <section id="forces" data-section>
                    <div className="bg-white/10 backdrop-blur-lg p-8 outline outline-1 outline-white/20">
                      <h2 className="text-3xl font-bold text-white mb-12">{future.content.forces.title}</h2>
                      <div className="space-y-6">
                        {future.content.forces.items.map((item, index) => (
                          <div key={index} className="flex items-start gap-6">
                            <div className="flex-shrink-0 w-14 h-14 bg-white/5 rounded-lg flex items-center justify-center">
                              <div className={`w-8 h-8 rounded ${item.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-lg mb-2">{item.title}</p>
                              <div className="flex items-center gap-2">
                                {item.trend === 'up' ? (
                                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {future.content.strategicPlays && (
                  <section id="strategicPlays" data-section>
                    <div className="bg-white/10 backdrop-blur-lg p-8 outline outline-1 outline-white/20">
                      <h2 className="text-3xl font-bold text-white mb-12">{future.content.strategicPlays.title}</h2>
                      <div className="space-y-6">
                        {future.content.strategicPlays.items.map((play, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <p className="text-white/80 text-lg leading-relaxed pt-1">{play}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
