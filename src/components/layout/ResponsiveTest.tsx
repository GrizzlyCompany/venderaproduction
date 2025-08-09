'use client';

import { useState, useEffect } from 'react';

export function ResponsiveTest() {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getBreakpoint = () => {
    if (screenSize.width >= 1280) return 'xl';
    if (screenSize.width >= 1024) return 'lg';
    if (screenSize.width >= 768) return 'md';
    if (screenSize.width >= 640) return 'sm';
    return 'xs';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50 md:hidden">
      <div>{screenSize.width}x{screenSize.height}</div>
      <div>Breakpoint: {getBreakpoint()}</div>
    </div>
  );
}