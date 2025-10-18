"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// 计时器组件
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // 计算到2030年1月1日的时间
    const targetDate = new Date("2030-01-01T00:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex items-center gap-[16px] w-[240px]">
      {/* 天数 */}
      <div className="flex flex-col items-center">
        <span className="text-[14px] font-bold text-white">
          {timeLeft.days.toString().padStart(3, '0')}
        </span>
        <span className="text-[12px] text-white/60 uppercase leading-none">DAY</span>
      </div>

      {/* 小时 */}
      <div className="flex flex-col items-center">
        <span className="text-[14px] font-bold text-white">
          {timeLeft.hours.toString().padStart(2, '0')}
        </span>
        <span className="text-[12px] text-white/60 uppercase leading-none">HR</span>
      </div>

      {/* 分钟 */}
      <div className="flex flex-col items-center">
        <span className="text-[14px] font-bold text-white">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </span>
        <span className="text-[12px] text-white/60 uppercase leading-none">MIN</span>
      </div>

      {/* 秒数 */}
      <div className="flex flex-col items-center">
        <span className="text-[14px] font-bold text-white">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-[12px] text-white/60 uppercase leading-none">SEC</span>
      </div>

      {/* "To 2030" 文字 */}
      <div className="absolute bottom-0 right-0">
        <span className="text-white text-[14px] font-bold">To 2030</span>
      </div>

      {/* 折线 SVG */}
      <svg 
        className="absolute top-0 left-0 pointer-events-none"
        width="240"
        height="40"
        viewBox="0 0 240 40"
      >
        <polyline
          points="0,40 150,40 180,10 240,10"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      </svg>
    </div>
  );
}

// 菜单按钮组件
function MenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="flex flex-col justify-center items-center gap-1 p-2 hover:opacity-80 transition-opacity"
      aria-label="菜单"
    >
      <div className="w-6 h-0.5 bg-white"></div>
      <div className="w-6 h-0.5 bg-white"></div>
      <div className="w-6 h-0.5 bg-white"></div>
    </button>
  );
}

// 主导航组件
export default function Navigation() {
  return (
    <nav 
      className="fixed left-0 right-0 z-50 h-16 flex items-center justify-between px-16 bg-transparent"
      style={{ height: '64px', marginTop: '16px' }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/images/4f_logo.svg"
          alt="Four Futures of AI Logo"
          width={120}
          height={64}
          className="h-16"
        />
      </div>

      {/* 右侧内容 */}
      <div className="flex items-center gap-8">
        {/* 计时器 */}
        <CountdownTimer />
        
        {/* 菜单按钮 */}
        <MenuButton />
      </div>
    </nav>
  );
}
