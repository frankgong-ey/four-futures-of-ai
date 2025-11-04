"use client";

import React, { useState, useRef, useEffect } from "react";
import { PLAY_CONTENT } from "../data/strategicPlaysContent";
import StrategicPlayIcons from "./StrategicPlayIcons";

export default function DetailView({ future, onClose }) {
  const [activeSection, setActiveSection] = useState("about");
  const [isVisible, setIsVisible] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(0.01);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [isPlayOverlayVisible, setIsPlayOverlayVisible] = useState(false);
  const videoRef = useRef(null);
  const contentRef = useRef(null);

  // Detect future type and resolve its background image path
  const getFutureType = () => {
    if (!future?.id) return null;
    const id = future.id;
    if (id.startsWith('collapse')) return 'collapse';
    if (id.startsWith('constraint')) return 'constraint';
    if (id.startsWith('growth')) return 'growth';
    if (id.startsWith('transform')) return 'transform';
    return null;
  };

  const futureType = getFutureType();
  const hasBackgroundImage = futureType !== null;

  // Get the future logo path
  const getFutureLogo = (futureId) => {
    if (!futureId) return null;
    const parts = futureId.split('-');
    const baseType = parts[0]; // constraint, growth, transform, collapse
    const logoMap = {
      'constraint': 'constraint-logo',
      'growth': 'growth-logo',
      'transform': 'transform-logo',
      'collapse': 'collapse-logo'
    };
    const logoName = logoMap[baseType];
    return logoName ? `/images/${logoName}.svg` : null;
  };

  const logoPath = getFutureLogo(future.id);

  // Get icon ID for strategic play
  const getPlayIconId = (playKey) => {
    if (!playKey) return null;
    return `ico-${playKey}`;
  };

  // Story image from data (detailData.js): use if provided
  const storyImageUrl = (future && future.content && future.content.about && future.content.about.storyImage)
    ? future.content.about.storyImage
    : null;

  // Get video path
  const getVideoPath = () => {
    if (!futureType) return null;
    return `/videos/${futureType}-video.mp4`;
  };

  // Handle video playback
  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    setIsVideoLoading(true);
  };

  // When switching to playing state, trigger video.load()
  useEffect(() => {
    if (isVideoPlaying && videoRef.current) {
      videoRef.current.load();
    }
  }, [isVideoPlaying]);

  // Strategic Play Overlay fade-in effect
  useEffect(() => {
    if (selectedPlay) {
      setIsPlayOverlayVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsPlayOverlayVisible(true);
        });
      });
    } else {
      setIsPlayOverlayVisible(false);
    }
  }, [selectedPlay]);

  // Video can play
  const handleVideoCanPlay = () => {
    setIsVideoLoading(false);
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Playback failed:', err);
        setIsVideoLoading(false);
      });
    }
  };

  // Video load start
  const handleVideoLoadStart = () => {
    setIsVideoLoading(true);
  };

  // 视频加载错误处理
  const handleVideoError = () => {
    setIsVideoLoading(false);
    console.error('Video failed to load');
    // 可以显示错误提示，或回退到 thumbnail
  };

  // 淡入动画效果
  useEffect(() => {
    // 延迟一帧以确保初始状态被渲染
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });

    // 延迟 1 秒后背景图层透明度变为 1
    const timer = setTimeout(() => {
      setBgOpacity(1);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
      {/* SVG Sprite for Strategic Play Icons */}
      <StrategicPlayIcons />

      {/* 背景遮罩 */}
      <div 
        className={`fixed inset-0 z-[99] transition-opacity duration-500 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 1)'
        }}
      >
        {/* 如果有关未来类型，显示背景图片 */}
        {hasBackgroundImage && (
          <>
            <img 
              src={`/images/${futureType}-bg.jpg`}
              alt="Background" 
              className="fixed inset-0 w-full h-full object-cover z-[99] transition-opacity duration-1000 ease-in-out"
              style={{
                pointerEvents: 'none',
                opacity: bgOpacity
              }}
            />
            {/* 深色遮罩以保持可读性 */}
            <div 
              className="absolute inset-0 bg-black/60 z-[99] transition-opacity duration-1000 ease-in-out"
              style={{
                opacity: bgOpacity
              }}
            ></div>
          </>
        )}
      </div>
      
      {/* Modal 内容（添加 isolate 创建独立 stacking context） */}
      <div 
        className={`fixed inset-0 text-white flex z-[100] isolate transition-opacity duration-500 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
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
              className="text-5xl font-normal mb-4 leading-tight break-words"
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
          <div className="text-center text-white/40 text-[14px]">
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
              <div className="relative bg-white/5 backdrop-blur-lg p-8 outline outline-1 outline-white/20">
                {/* 左上角装饰 */}
                <div className="absolute left-0 top-0 w-4 h-1 bg-white/50"></div>
                <div className="absolute left-0 top-0 w-1 h-4 bg-white/50"></div>
                
                {/* Future Logo - 在标题上方 */}
                {logoPath && (
                  <div className="mb-6">
                    <img 
                      src={logoPath} 
                      alt="Future logo" 
                      className="w-16 h-16 opacity-80"
                    />
                  </div>
                )}
                
                <h2 className="text-3xl font-bold text-white mb-8">
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
                
                {/* Industry 背景图片 - 仅在 sectorized 版本显示 */}
                {isSectorized && storyImageUrl && (
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img 
                      src={storyImageUrl}
                      alt="Industry background"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* 视频部分 - All-Industry 才显示（sectorized 不显示） */}
                {!isSectorized && future.content.about.video && !future.content.about.hideVideo && (
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    {!isVideoPlaying ? (
                      <>
                        <img 
                          src={futureType ? `/images/industry/${futureType}-thumbnail.jpg` : future.content.about.video.thumbnail}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <button 
                            onClick={handleVideoPlay}
                            className="w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                          >
                            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {isVideoLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                            <div className="text-center">
                              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-white text-sm">Loading video...</p>
                            </div>
                          </div>
                        )}
                        <video
                          ref={videoRef}
                          src={getVideoPath()}
                          controls
                          preload="none"
                          className="w-full h-full object-cover"
                          onLoadStart={handleVideoLoadStart}
                          onCanPlay={handleVideoCanPlay}
                          onError={handleVideoError}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* 两类版本渲染：Sectorized vs All-Industry */}
            {isSectorized ? (
              <>
                {future.content.valueChainImpacts && (
                  <section id="valueChainImpacts" data-section>
                    <div className="relative bg-white/5 backdrop-blur-lg p-8 outline outline-1 outline-white/20">
                      {/* 左上角装饰 */}
                      <div className="absolute left-0 top-0 w-4 h-1 bg-white/50 "></div>
                      <div className="absolute left-0 top-0 w-1 h-4 bg-white/50 "></div>
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
                    <div className="relative bg-white/5 backdrop-blur-lg p-8 outline outline-1 outline-white/20">
                      {/* 左上角装饰 */}
                      <div className="absolute left-0 top-0 w-4 h-1 bg-white/50 "></div>
                      <div className="absolute left-0 top-0 w-1 h-4 bg-white/50 "></div>
                      <h2 className="text-3xl font-bold text-white mb-6">{future.content.strategicResponse.title}</h2>
                      {future.content.strategicResponse.description && (
                        <p className="text-white/80 text-base leading-relaxed mb-8">{future.content.strategicResponse.description}</p>
                      )}
                      <div className="space-y-6">
                        {future.content.strategicResponse.items.map((play, index) => {
                          // 支持新的对象格式和旧的字符串格式
                          const itemText = typeof play === 'string' ? play : play.text;
                          const itemIcon = typeof play === 'object' && play.icon ? play.icon : null;
                          
                          return (
                            <div key={index} className="flex items-center gap-6">
                              <div className="flex-shrink-0 w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                {itemIcon ? (
                                  <img 
                                    src={itemIcon} 
                                    alt="" 
                                    className="w-7 h-7"
                                  />
                                ) : (
                                  <span className="text-white font-bold">{index + 1}</span>
                                )}
                              </div>
                              <p className="text-white font-bold text-lg leading-relaxed pt-1">{itemText}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                )}
              </>
            ) : (
              <>
                {future.content.forces && (
                  <section id="forces" data-section>
                    <div className="relative bg-white/5 backdrop-blur-lg p-8 outline outline-1 outline-white/20">
                      {/* 左上角装饰 */}
                      <div className="absolute left-0 top-0 w-4 h-1 bg-white/50 "></div>
                      <div className="absolute left-0 top-0 w-1 h-4 bg-white/50 "></div>
                      <h2 className="text-3xl font-bold text-white mb-12">{future.content.forces.title}</h2>
                      <div className="space-y-6">
                        {future.content.forces.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-6">
                            <div className="flex-shrink-0 w-14 h-14 bg-white/5 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white text-xl font-normal mb-2">{item.title}</h3>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {future.content.strategicPlays && (
                  <section id="strategicPlays" data-section>
                    <div className="relative bg-white/5 backdrop-blur-lg p-8 outline outline-1 outline-white/20">
                      {/* 左上角装饰 */}
                      <div className="absolute left-0 top-0 w-4 h-1 bg-white/50 "></div>
                      <div className="absolute left-0 top-0 w-1 h-4 bg-white/50 "></div>
                      <h2 className="text-3xl font-bold text-white mb-12">{future.content.strategicPlays.title}</h2>
                      <div className="space-y-3">
                        {future.content.strategicPlays.items.map((play, index) => {
                          // 获取 play 内容
                          const playContent = PLAY_CONTENT[play];
                          const displayText = playContent ? playContent.title : play;
                          
                          return (
                            <button
                              key={index}
                              onClick={() => playContent && setSelectedPlay(playContent)}
                              className="w-full flex items-center gap-4 cursor-pointer border border-white/20 hover:border-white/40 transition-all duration-200 p-4"
                              style={{
                                backgroundColor: future.color,
                              }}
                              disabled={!playContent}
                            >
                              <div className="flex-shrink-0 w-14 h-14 bg-black rounded-full flex items-center justify-center">
                                {getPlayIconId(play) ? (
                                  <svg className="w-8 h-8 text-white" fill="currentColor">
                                    <use href={`#${getPlayIconId(play)}`} />
                                  </svg>
                                ) : (
                                  <span className="text-white font-bold text-lg">{index + 1}</span>
                                )}
                              </div>
                              <p className="text-white text-lg font-bold leading-relaxed pt-1 text-left">{displayText}</p>
                            </button>
                          );
                        })}
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

      {/* Strategic Play Overlay */}
      {selectedPlay && (
        <>
          {/* 背景遮罩 */}
          <div 
            className={`fixed inset-0 bg-black/80 z-[9998] transition-opacity duration-500 ease-out ${
              isPlayOverlayVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setSelectedPlay(null)}
          ></div>
          
          {/* Overlay 内容 */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
            <div className={`relative w-full max-w-4xl bg-black outline outline-1 outline-white/20 p-12 pointer-events-auto transition-opacity duration-500 ease-out ${
              isPlayOverlayVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* 关闭按钮 */}
              <button
                onClick={() => setSelectedPlay(null)}
                className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-12 h-12 border border-white flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </button>

              {/* 标题 */}
              <h2 className="text-4xl font-bold text-white mb-8 pr-16">
                {selectedPlay.title}
              </h2>

              {/* 描述 */}
              <p className="text-xl text-white/80 mb-12 leading-relaxed">
                {selectedPlay.desc}
              </p>

              {/* Bullets */}
              {selectedPlay.bullets && selectedPlay.bullets.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-white mb-6">Key Benefits</h3>
                  <div className="space-y-4">
                    {selectedPlay.bullets.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-1 h-1 bg-white mt-3"></div>
                        <p className="text-lg text-white/80 leading-relaxed">{bullet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent */}
              {selectedPlay.recent && selectedPlay.recent.length > 0 && (
                <div className="border-t border-white/20 pt-8">
                  <h3 className="text-2xl font-semibold text-white mb-6">Recent Examples</h3>
                  <div className="space-y-4">
                    {selectedPlay.recent.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-1 h-1 bg-white/60 mt-3"></div>
                        <p className="text-lg text-white/60 leading-relaxed italic">"{item}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
