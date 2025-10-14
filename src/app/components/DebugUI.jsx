import React from 'react';

const DebugUI = ({ scrollProgress, neonProgress }) => {
  return (
    <div className="fixed top-4 right-4 text-white text-xs pointer-events-none" style={{ zIndex: 50, fontFamily: 'monospace' }}>
      <div className="bg-black bg-opacity-50 p-3 rounded">
        <div>Scroll Progress: {(scrollProgress * 100).toFixed(1)}%</div>
        <div>Neon Progress: {(neonProgress * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
};

export default DebugUI;
