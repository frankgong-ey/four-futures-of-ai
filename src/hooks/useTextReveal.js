import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

// 注册SplitText插件
gsap.registerPlugin(SplitText);

/**
 * 文字升起效果Hook
 * @param {Object} options - 配置选项
 * @param {number} options.delay - 动画开始延迟时间（秒）
 * @param {number} options.duration - 每行动画持续时间（秒）
 * @param {number} options.stagger - 每行间隔时间（秒）
 * @param {string} options.ease - 缓动函数
 * @param {boolean} options.enabled - 是否启用动画
 * @returns {Object} - 返回ref和动画控制函数
 */
export const useTextReveal = ({
  delay = 0.5,
  duration = 0.8,
  stagger = 0.3,
  ease = "power3.out",
  enabled = true
} = {}) => {
  const textRef = useRef(null);
  const splitInstancesRef = useRef([]);
  const animationTimelineRef = useRef(null);

  // 创建遮罩效果
  const createMaskEffect = useCallback((lineElement) => {
    if (!lineElement) return null;
    
    // 设置行元素的样式
    Object.assign(lineElement.style, {
      position: 'relative',
      overflow: 'hidden'
    });
    
    // 创建遮罩容器
    const maskContainer = document.createElement('div');
    Object.assign(maskContainer.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    });
    
    // 将文字内容移动到遮罩容器中
    const textContent = lineElement.innerHTML;
    lineElement.innerHTML = '';
    maskContainer.innerHTML = textContent;
    lineElement.appendChild(maskContainer);
    
    // 设置文字初始状态 - 从下方隐藏
    gsap.set(maskContainer, { y: "100%" });
    
    return maskContainer;
  }, []);

  // 创建行动画
  const createLineAnimation = useCallback((masks, startTime) => {
    let currentTime = startTime;
    const tl = gsap.timeline();
    
    masks.forEach((mask) => {
      if (mask) {
        tl.to(mask, {
          y: "0%",
          duration,
          ease
        }, currentTime);
        currentTime += stagger;
      }
    });
    
    return { timeline: tl, endTime: currentTime };
  }, [duration, ease, stagger]);

  // 启动动画
  const startAnimation = useCallback(() => {
    if (!enabled || !textRef.current || animationTimelineRef.current) return;
    
    const tl = gsap.timeline();
    animationTimelineRef.current = tl;
    
    // 使用autoAlpha设置初始状态 - 这会同时设置opacity和visibility
    gsap.set(textRef.current, { autoAlpha: 0 });

    // 等待DOM渲染完成后创建动画
    const timer = setTimeout(() => {
      if (!textRef.current) return;
      
      try {
        // 使用SplitText分割文字
        const split = new SplitText(textRef.current, {
          type: "lines",
          linesClass: "reveal-line"
        });

        // 存储SplitText实例用于清理
        splitInstancesRef.current = [split];

        // 创建遮罩效果
        const masks = split.lines.map(createMaskEffect).filter(Boolean);

        if (masks.length > 0) {
          // 创建动画
          const animation = createLineAnimation(masks, delay);
          
          // 添加到时间线
          tl.add(animation.timeline)
            .to(textRef.current, {
              autoAlpha: 1,
              duration: 0.1,
              ease: "none"
            }, delay);
        }
          
      } catch (error) {
        console.error('Text reveal animation setup failed:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [enabled, delay, createMaskEffect, createLineAnimation]);

  // 停止动画
  const stopAnimation = useCallback(() => {
    if (animationTimelineRef.current) {
      animationTimelineRef.current.kill();
      animationTimelineRef.current = null;
    }
  }, []);

  // 重置动画
  const resetAnimation = useCallback(() => {
    stopAnimation();
    
    // 清理SplitText实例
    splitInstancesRef.current.forEach(split => {
      if (split && split.revert) {
        split.revert();
      }
    });
    splitInstancesRef.current = [];
    
    // 重置文字状态
    if (textRef.current) {
      gsap.set(textRef.current, { autoAlpha: 0 });
    }
  }, [stopAnimation]);

  // 初始化时隐藏文字 - 现在由CSS控制，不需要JavaScript设置

  // 自动启动动画
  useEffect(() => {
    if (enabled) {
      const cleanup = startAnimation();
      return cleanup;
    }
    // 注意：opacity现在由CSS控制，不需要JavaScript设置
  }, [enabled, startAnimation]);

  // 清理函数
  useEffect(() => {
    return () => {
      stopAnimation();
      // 清理SplitText实例
      splitInstancesRef.current.forEach(split => {
        if (split && split.revert) {
          split.revert();
        }
      });
      splitInstancesRef.current = [];
    };
  }, [stopAnimation]);

  return {
    textRef,
    startAnimation,
    stopAnimation,
    resetAnimation
  };
};

export default useTextReveal;
