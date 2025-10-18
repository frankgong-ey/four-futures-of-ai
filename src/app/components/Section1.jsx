'use client';

import { forwardRef } from 'react';

const Section1 = forwardRef(function Section1(props, ref) {
  return (
    <section 
      ref={ref}
      className="fixed top-0 left-0 w-screen h-screen flex items-start text-white pointer-events-none"
      style={{ paddingLeft: '24px', paddingTop: '120px', opacity: 0, zIndex: 10 }}
    >
      <div className="max-w-[800px]">
        <p className="text-sm opacity-80 mb-2">Chapter I · The Introduction</p>
        <h1 className="font-light leading-[0.95] tracking-[-0.05em]"
            style={{
              fontSize: "clamp(32px, 6vw, 120px)",
              color: "#FFFFFF"
            }}>
          Will you shape the future of AI,
        </h1>
      </div>
      
      {/* 右下角固定的副标题 */}
      <div className="absolute bottom-24 right-24 text-right pointer-events-none">
        <div
          className="text-white font-light opacity-80 tracking-[-0.05em] fancy-text"
          style={{
            fontSize: "clamp(32px, 6vw, 120px)",
            textShadow: "0 0 20px rgba(80,200,255,.35)",
          }}
        >
          or will it shape you?
        </div>
      </div>
    </section>
  );
});

export default Section1;
