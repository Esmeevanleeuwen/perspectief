import ParticleHero from "@/app/components/homepage/ParticleHero";
import MeridianPerspective from "@/app/components/homepage/MeridianPerspective";
import FeaturedArticles from "@/app/components/homepage/FeaturedArticles";

export default function Home() {
  return (
    <main>
      <ParticleHero />
      <MeridianPerspective />
      <FeaturedArticles />
    </main>
  );
}
