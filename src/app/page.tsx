import ParticleHero from "@/app/components/homepage/ParticleHero";
import DossierSystemPreview from "@/app/components/homepage/DossierSystemPreview";
import FeaturedArticles from "@/app/components/homepage/FeaturedArticles";
import { getDossier, getDossiers } from "@/lib/dossier-network";
import { pageMetadata } from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Meridian — het verhaal achter de gebeurtenis",
  "Onderzoek maatschappelijke vragen via doorlopende dossiers, hoofdstukken, artikelen en bronnen.",
  "/",
);

export default async function Home() {
  const [dossiers, crimeDossier] = await Promise.all([
    getDossiers(),
    getDossier("criminaliteit-als-systeem"),
  ]);

  const crimeSummary = crimeDossier ?? dossiers.find((dossier) => dossier.slug === "criminaliteit-als-systeem");

  const featured = {
    slug: crimeSummary?.slug ?? "criminaliteit-als-systeem",
    title: crimeSummary?.title ?? "Criminaliteit als systeem",
    description: crimeSummary?.description ?? "Hoe gedrag, zichtbaarheid, classificatie, capaciteit en strafrechtelijke verwerking één systeem vormen.",
    status: crimeSummary?.status ?? "Onderzoek in opbouw",
    pageCount: crimeDossier?.documents?.reduce((total, document) => total + document.pageCount, 0) ?? 0,
    themeCount: crimeSummary?.themes.length ?? 0,
  };

  const related = dossiers
    .filter((dossier) => dossier.slug !== featured.slug)
    .slice(0, 3)
    .map((dossier) => ({
      slug: dossier.slug,
      title: dossier.title,
      description: dossier.description,
      themes: dossier.themes,
    }));

  return (
    <main>
      <ParticleHero />
      <DossierSystemPreview featured={featured} related={related} />
      <FeaturedArticles />
    </main>
  );
}
