import { useState, useEffect, useRef } from 'react';

// 自定义Hook用于管理文本动画的触发时机
export const useAnimatedText = (scrollProgress, startRange, endRange) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [lastTriggeredRange, setLastTriggeredRange] = useState(null);
  const resetTimerRef = useRef(null);

  useEffect(() => {
    const isInRange = scrollProgress >= startRange && scrollProgress < endRange;
    const currentRange = `${startRange}-${endRange}`;
    
    // 清除之前的定时器
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    
    if (isInRange && lastTriggeredRange !== currentRange) {
      // 进入新的范围，触发动画
      setShouldAnimate(true);
      setLastTriggeredRange(currentRange);
      
      // 短暂延迟后重置shouldAnimate，让AnimatedText组件可以重新触发
      resetTimerRef.current = setTimeout(() => {
        setShouldAnimate(false);
      }, 100);
    } else if (!isInRange) {
      // 离开当前范围，立即重置状态
      if (lastTriggeredRange === currentRange) {
        setShouldAnimate(false);
        setLastTriggeredRange(null);
      }
    }
    
    // 清理函数
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, [scrollProgress, startRange, endRange, lastTriggeredRange]);

  return { shouldAnimate };
};

// 预设的动画配置
export const textAnimationConfig = {
  // 基础配置
  default: {
    delay: 0,
    wordDelay: 0.05,
    duration: 0.6
  },
  
  // 快速动画
  fast: {
    delay: 0,
    wordDelay: 0.03,
    duration: 0.4
  },
  
  // 慢速动画
  slow: {
    delay: 0,
    wordDelay: 0.08,
    duration: 0.8
  },
  
  // 延迟动画
  delayed: {
    delay: 0.2,
    wordDelay: 0.06,
    duration: 0.5
  }
};
