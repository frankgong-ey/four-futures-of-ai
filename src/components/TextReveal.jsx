"use client";

import React, { forwardRef } from 'react';
import { useTextReveal } from '../hooks/useTextReveal';

/**
 * 文字升起效果组件
 * 可以包装任何文字内容，自动应用升起动画效果
 */
const TextReveal = forwardRef(({
  children,
  delay = 0.5,
  duration = 0.8,
  stagger = 0.3,
  ease = "power3.out",
  enabled = true,
  className = "",
  style = {},
  as: Component = 'div',
  ...props
}, ref) => {
  const { textRef } = useTextReveal({
    delay,
    duration,
    stagger,
    ease,
    enabled
  });

  // 合并ref
  const combinedRef = (node) => {
    if (textRef) textRef.current = node;
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };

  return (
    <Component
      ref={combinedRef}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
});

TextReveal.displayName = 'TextReveal';

export default TextReveal;
