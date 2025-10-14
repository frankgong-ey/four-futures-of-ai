import React from 'react';

const Navigation = ({ isLoading }) => {
  if (isLoading) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-[60] pointer-events-auto">
      <div className="flex items-center gap-3 select-none" aria-hidden="true">
        <img src="/images/nav_logo.svg" alt="Navigation" className="h-16 w-auto" />
      </div>
    </div>
  );
};

export default Navigation;
