import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const AnimatedText = ({ 
  text, 
  className = '', 
  delay = 0,
  wordDelay = 0.1, // 每个单词之间的延迟
  duration = 1.0, // 每个单词的淡入持续时间
  trigger = true, // 控制动画是否触发
  sectionVisible = true // 控制Section是否可见
}) => {
  const [words, setWords] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const isAnimatingRef = useRef(false);

  // 将文本分割成单词
  useEffect(() => {
    const wordArray = text.split(' ').map((word, index) => ({
      text: word,
      id: index,
      opacity: 0
    }));
    setWords(wordArray);
  }, [text]);

  // 动画逻辑
  useEffect(() => {
    if (!trigger || !sectionVisible || words.length === 0 || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsVisible(true);

    // 先重置所有单词的透明度
    words.forEach((word) => {
      gsap.set(`.animated-word-${word.id}`, { opacity: 0 });
    });

    // 创建时间线
    const tl = gsap.timeline({ delay });

    // 为每个单词添加淡入动画
    words.forEach((word, index) => {
      tl.to(`.animated-word-${word.id}`, {
        opacity: 1,
        duration: duration,
        ease: "power2.out"
      }, index * wordDelay);
    });

    // 动画完成后重置状态
    tl.call(() => {
      isAnimatingRef.current = false;
    });

    // 清理函数
    return () => {
      tl.kill();
      isAnimatingRef.current = false;
    };
  }, [trigger, sectionVisible, words, delay, wordDelay, duration]);

  // 当trigger变为false或Section不可见时，平滑地淡出所有单词
  useEffect(() => {
    if ((!trigger || !sectionVisible) && words.length > 0) {
      isAnimatingRef.current = false;
      const tl = gsap.timeline();
      
      // 所有单词同时淡出，快速且平滑
      words.forEach((word) => {
        tl.to(`.animated-word-${word.id}`, {
          opacity: 0,
          duration: 0.2, // 稍微慢一点的淡出
          ease: "power2.out"
        }, 0); // 所有单词同时开始
      });
    }
  }, [trigger, sectionVisible, words]);

  return (
    <h2 className={className}>
      {words.map((word) => (
        <span
          key={word.id}
          className={`animated-word-${word.id} inline-block`}
          style={{ opacity: 0 }}
        >
          {word.text}
          {word.id < words.length - 1 && '\u00A0'} {/* 非断行空格 */}
        </span>
      ))}
    </h2>
  );
};

export default AnimatedText;
