import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";

import SiteFooter from "@/app/components/Layout/SiteFooter";
import SiteHeader from "@/app/components/Layout/SiteHeader";

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
  title: "Meridian",
  description:
    "Gebeurtenissen, perspectieven, bronnen en structuren verbonden tot een groter beeld.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${inter.variable} ${newsreader.variable}`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
