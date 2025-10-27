"use client";

import { usePathname } from 'next/navigation';
import NextButton from './NextButton';
import ScrollProgress from './ScrollProgress';
import { BOOTH_SECTION_POSITIONS } from '../app/booth/config/sections';

export default function LayoutClient() {
  const pathname = usePathname();
  const isBoothPage = pathname === '/booth';
  const isFuturesPage = pathname?.startsWith('/futures');
  const isDetailPage = pathname?.startsWith('/futures/') && pathname !== '/futures';

  // 在 DetailView 页面不显示任何组件
  if (isDetailPage) {
    return null;
  }

  // 只在 booth 页面显示组件
  if (!isBoothPage) {
    // 在 futures 页面只显示 ScrollProgress，不显示 NextButton
    if (isFuturesPage) {
      return <ScrollProgress />;
    }
    return <NextButton />;
  }

  return (
    <>
      <NextButton sections={BOOTH_SECTION_POSITIONS} />
      <ScrollProgress />
    </>
  );
}

