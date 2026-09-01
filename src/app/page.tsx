import ParticleHero from "@/app/components/homepage/ParticleHero";
import FeaturedResearch from "@/app/components/homepage/FeaturedResearch";
import CurrentDevelopments from "@/app/components/homepage/CurrentDevelopments";
import FeaturedArticles from "@/app/components/homepage/FeaturedArticles";

import { Instrument_Serif, Inter } from "next/font/google";

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function Home() {
  return (
    <main>
      <ParticleHero />
      <FeaturedResearch />
      <FeaturedArticles />
      <CurrentDevelopments />


    </main>
  );
}