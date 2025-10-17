import React, { useState, useEffect } from 'react';

const CSSAnimatedText = ({ 
  text, 
  className = '', 
  trigger = true,
  sectionVisible = true,
  wordDelay = 100, // 每个单词之间的延迟（毫秒）
  animationDuration = 600 // 每个单词的动画持续时间（毫秒）
}) => {
  const [words, setWords] = useState([]);
  const [animationKey, setAnimationKey] = useState(0);

  // 将文本分割成单词
  useEffect(() => {
    const wordArray = text.split(' ').map((word, index) => ({
      text: word,
      id: index,
      delay: index * wordDelay
    }));
    setWords(wordArray);
  }, [text, wordDelay]);

  // 触发动画
  useEffect(() => {
    if (trigger && sectionVisible) {
      // 重置动画
      setAnimationKey(prev => prev + 1);
    }
  }, [trigger, sectionVisible]);

  return (
    <h2 className={className} key={animationKey}>
      {words.map((word) => (
        <span
          key={`${animationKey}-${word.id}`}
          className="inline-block opacity-0 animate-fade-in"
          style={{
            animationDelay: `${word.delay}ms`,
            animationDuration: `${animationDuration}ms`,
            animationFillMode: 'forwards'
          }}
        >
          {word.text}
          {word.id < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </h2>
  );
};

export default CSSAnimatedText;
