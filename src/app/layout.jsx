"use client";

import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import BackgroundLines from "../components/BackgroundLines";
import Navigation from "../components/Navigation";
import LayoutClient from "../components/LayoutClient";
import Global3DCanvas, { ScrollSectionContext } from "../components/Global3DCanvas";
import { useState } from "react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// EYInterstate
const eyInterstate = localFont({
  src: [
    {
      path: "../fonts/EYInterstate-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/EYInterstate-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/EYInterstate-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-eyinterstate",
  display: "swap",
});

// Interstate Black Condensed for titles
const interstateBlackCondensed = localFont({
  src: "../fonts/interstate-black-cond.otf",
  variable: "--font-interstate-black-cond",
  display: "swap",
});

export default function RootLayout({
  children,
}) {
  const [currentSection, setCurrentSection] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <html lang="en">
      <ScrollSectionContext.Provider value={{ currentSection, setCurrentSection, modalOpen, setModalOpen }}>
        <body
          className={`${eyInterstate.variable} ${interstateBlackCondensed.variable} antialiased`}
        >
          <Navigation />
          <BackgroundLines />
          <LayoutClient />
          {pathname?.startsWith('/futures') && (
            <Global3DCanvas key="futures-canvas" currentSection={currentSection} />
          )}
          {children}
        </body>
      </ScrollSectionContext.Provider>
    </html>
  );
}


