import type { Metadata } from "next";
import {
  Inter,
  Newsreader,
} from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Perspectief",
  description:
    "Perspectieven, ervaringen en informatie verbonden tot een groter beeld.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${inter.variable} ${newsreader.variable}`}
      >
        {children}
      </body>
    </html>
  );
}