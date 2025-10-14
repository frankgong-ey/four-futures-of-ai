import React, { forwardRef } from 'react';

const Section5 = forwardRef((props, ref) => {
  return (
    <section 
      ref={ref}
      className="fixed top-0 left-0 w-screen h-screen text-white pointer-events-none"
      style={{ 
        opacity: 0, 
        zIndex: 10
      }}
    >
      {/* 顶部标题 */}
      <div className="absolute top-12 left-0 w-full text-center pt-20 pointer-events-auto">
        <h2 className="text-4xl md:text-5xl font-light leading-tight tracking-[-0.05em]">
          By 2030, will AI progress be defined by...
        </h2>
      </div>
    </section>
  );
});

Section5.displayName = 'Section5';

export default Section5;
