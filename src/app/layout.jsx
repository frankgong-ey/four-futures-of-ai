import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import BackgroundLines from "../components/BackgroundLines";
import Navigation from "../components/Navigation";

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

export const metadata = {
  title: "Four Futures of AI",
  description: "An immersive exhibit exploring possible futures of AI.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body
        className={`${eyInterstate.variable} ${interstateBlackCondensed.variable} antialiased`}
      >
        <Navigation />
        <BackgroundLines />
        {children}
      </body>
    </html>
  );
}


