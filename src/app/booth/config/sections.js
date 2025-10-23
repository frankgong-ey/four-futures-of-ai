// Booth页面的Section配置
export const BOOTH_SECTION_POSITIONS = [
  { name: 'hero', top: 0, duration: 0.5, ease: "power2.inOut" },           // 0vh, 快速
  { name: 'gallery', top: 102, duration: 10.0, ease: "none" },             // 100vh, 慢速, 匀速linear
  { name: 'chart', top: 400, duration: 1.5, ease: "power2.inOut" },        // 400vh, 默认速度, 缓动
  { name: 'quote', top: 500, duration: 1.5, ease: "power2.inOut" },        // 500vh, 默认速度, 缓动
  { name: 'question', top: 600, duration: 2.0, ease: "power2.inOut" },     // 600vh, 稍慢, 缓动
  { name: 'ending', top: 1100, duration: 1.5, ease: "power2.inOut" },      // 1100vh, 默认速度, 缓动
  { name: 'video', top: 1200, duration: 1.5, ease: "power2.inOut" },       // 1200vh, 默认速度, 缓动
];

