"use client";

import { usePathname } from 'next/navigation';
import NextButton from './NextButton';
import ScrollProgress from './ScrollProgress';
import { BOOTH_SECTION_POSITIONS } from '../app/booth/config/sections';

export default function LayoutClient() {
  const pathname = usePathname();
  const isBoothPage = pathname === '/booth';

  // 只在 booth 页面显示组件
  if (!isBoothPage) {
    return <NextButton />;
  }

  return (
    <>
      <NextButton sections={BOOTH_SECTION_POSITIONS} />
      <ScrollProgress />
    </>
  );
}

