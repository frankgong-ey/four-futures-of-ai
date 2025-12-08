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
  const isDashboardPage = pathname?.startsWith('/booth-dashboard');
  const isVotePage = pathname === '/vote';
  const isResultsPage = pathname === '/results';
  const isValueBlueprintPage = pathname === '/value-blueprint';
  const isVBTestPage = pathname === '/vb';
  const isSuccessStoryPage = pathname === '/vb/success-story';
  const isHomePage = pathname === '/';

  // Do not render any global components on home page
  if (isHomePage) {
    return null;
  }

  // Do not render any global components on DetailView pages
  if (isDetailPage) {
    return null;
  }

  // Do not render any global components on dashboard pages
  if (isDashboardPage) {
    return null;
  }

  // Do not render any global components on vote page
  if (isVotePage) {
    return null;
  }

  // Do not render any global components on results page
  if (isResultsPage) {
    return null;
  }

  // Do not render any global components on value-blueprint page
  if (isValueBlueprintPage) {
    return null;
  }

  // Do not render any global components on vb page
  if (isVBTestPage) {
    return null;
  }

  // Do not render any global components on success-story page
  if (isSuccessStoryPage) {
    return null;
  }

  // Only render these components on the booth page
  if (!isBoothPage) {
    // On futures pages, only show ScrollProgress and hide NextButton
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

