import React, { forwardRef } from 'react';
import CSSAnimatedText from './CSSAnimatedText';
import { useAnimatedText } from '../hooks/useAnimatedText';

// 动画配置预设
const ANIMATION_PRESETS = {
  default: {
    wordDelay: 100,
    animationDuration: 600
  },
  fast: {
    wordDelay: 50,
    animationDuration: 400
  },
  slow: {
    wordDelay: 150,
    animationDuration: 800
  }
};

// Section配置
const SECTION_CONFIG = {
  section5: {
    text: "By 2030, will AI progress be defined by...",
    range: [0.40, 0.48],
    preset: 'default'
  },
  section6: {
    text: "By 2030, will AI be controlled by...",
    range: [0.50, 0.58],
    preset: 'default'
  },
  section7: {
    text: "By 2030, will AI progress be...",
    range: [0.60, 0.68],
    preset: 'default'
  },
  section8: {
    text: "By 2030, will...",
    range: [0.70, 0.78],
    preset: 'default'
  }
};

const SectionTitle = forwardRef(({ 
  sectionId, 
  scrollProgress, 
  className = "text-3xl md:text-6xl font-light leading-tight tracking-[-0.05em] max-w-2xl",
  customText, // 可选的自定义文本
  customRange, // 可选的自定义范围
  customPreset // 可选的自定义动画预设
}, ref) => {
  // 获取配置
  const config = SECTION_CONFIG[sectionId] || {};
  const text = customText || config.text || "Default Title";
  const range = customRange || config.range || [0, 1];
  const preset = customPreset || config.preset || 'default';
  const animationConfig = ANIMATION_PRESETS[preset];

  // 动画控制
  const { shouldAnimate } = useAnimatedText(scrollProgress, range[0], range[1]);
  const sectionVisible = scrollProgress >= range[0] && scrollProgress < range[1];

  return (
    <section 
      ref={ref}
      className="fixed top-0 left-0 w-screen h-screen text-white pointer-events-none"
      style={{ 
        opacity: 0, 
        zIndex: 10
      }}
    >
      {/* 垂直居中，左侧对齐的标题 */}
      <div className="absolute top-1/2 left-12 -translate-y-1/2 pointer-events-auto">
        <CSSAnimatedText
          text={text}
          className={className}
          trigger={shouldAnimate}
          sectionVisible={sectionVisible}
          wordDelay={animationConfig.wordDelay}
          animationDuration={animationConfig.animationDuration}
        />
      </div>
    </section>
  );
});

SectionTitle.displayName = 'SectionTitle';

export default SectionTitle;
