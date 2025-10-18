import React, { forwardRef } from 'react';

const Section10 = forwardRef((props, ref) => {
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
          Section 10 - Coming Soon...
        </h2>
      </div>
    </section>
  );
});

Section10.displayName = 'Section10';

export default Section10;
