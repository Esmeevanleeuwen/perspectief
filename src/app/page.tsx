import ParticleHero from "@/app/components/homepage/ParticleHero";
import SystemBridge from "@/app/components/homepage/SystemBridge";
import FeaturedArticles from "@/app/components/homepage/FeaturedArticles";

export default function Home() {
  return (
    <main>
      <ParticleHero />
      <SystemBridge />
      <FeaturedArticles />
    </main>
  );
}
