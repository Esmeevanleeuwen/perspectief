import ParticleHero from "@/app/components/homepage/ParticleHero";
import FeaturedResearch from "@/app/components/homepage/FeaturedResearch";
import FeaturedArticles from "@/app/components/homepage/FeaturedArticles";

export default function Home() {
  return (
    <main>
      <ParticleHero />
      <FeaturedResearch />
      <FeaturedArticles />
    </main>
  );
}
