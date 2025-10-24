"use client";

import React, { useState } from "react";

export default function DetailView({ future, onClose }) {
  const [activeSection, setActiveSection] = useState("about");

  const sections = [
    { id: "about", title: "About This Future" },
    { id: "forces", title: "Forces of Change" },
    { id: "strategicPlays", title: "Strategic Plays" }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "about":
        return (
          <div className="space-y-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-white/80">
                {future.content.about.description}
              </p>
            </div>
            
            {/* 视频部分 */}
            <div className="relative">
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <img 
                  src={future.content.about.video.thumbnail}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                  <span className="text-sm text-white">{future.content.about.video.duration}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "forces":
        return (
          <div className="space-y-6">
            {future.content.forces.items.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <div className={`w-6 h-6 rounded-full ${
                    item.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      item.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.trend === 'up' ? 'Increasing' : 'Decreasing'}
                    </span>
                    <svg className={`w-4 h-4 ${
                      item.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        item.trend === 'up' ? "M7 17l9.2-9.2M17 17V7H7" : "M17 7l-9.2 9.2M7 7v10h10"
                      } />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "strategicPlays":
        return (
          <div className="space-y-4">
            {future.content.strategicPlays.items.map((play, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white/80 leading-relaxed">{play}</p>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 左侧导航 */}
      <div className="fixed left-0 top-0 h-full w-80 bg-black/90 backdrop-blur-md border-r border-white/10 z-50">
        <div className="p-6 h-full flex flex-col">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Close</span>
          </button>

          {/* 标题 */}
          <div className="mb-8">
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: future.color }}
            >
              {future.title}
            </h1>
            <p className="text-white/60 leading-relaxed">
              {future.description}
            </p>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* 滚动提示 */}
          <div className="text-center text-white/40">
            <div className="text-sm mb-2">Scroll down to explore</div>
            <svg className="w-4 h-4 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* 右侧内容 */}
      <div className="ml-80">
        {/* 3D模型容器 - 左下角 */}
        <div className="fixed bottom-6 left-6 w-32 h-32 z-40 pointer-events-none">
          {/* 3D模型会通过全局Canvas渲染到这里 */}
        </div>
        
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              {sections.find(s => s.id === activeSection)?.title}
            </h2>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
