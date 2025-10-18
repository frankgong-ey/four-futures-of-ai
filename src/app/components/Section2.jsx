'use client';

import { forwardRef } from 'react';

const Section2 = forwardRef(function Section2(props, ref) {
  return (
    <section 
      ref={ref}
      className="fixed top-0 left-0 w-screen h-screen flex items-start text-white pointer-events-none"
      style={{ paddingLeft: '24px', paddingTop: '120px', opacity: 0, zIndex: 10 }}
    >
      <div className="max-w-[1100px]">
        <h2 className="font-light opacity-90 mb-6 tracking-[-0.05em]"
            style={{ fontSize: "clamp(20px, 3vw, 64px)" }}>
          In recent years, we have seen major improvements in AI across image and video creation capabilities.
        </h2>
      </div>
    </section>
  );
});

export default Section2;
