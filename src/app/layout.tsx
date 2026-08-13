import type { Metadata } from "next";
import {
  Inter,
  Newsreader,
} from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Perspectief",
  description:
    "Een groter beeld ontstaat uit meerdere perspectieven.",
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