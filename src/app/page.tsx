import ParticleHero from "@/app/components/homepage/ParticleHero";
import OtherResearch, { type OtherResearchItem } from "@/app/components/homepage/OtherResearch";
import FeaturedResearch from "@/app/components/homepage/FeaturedResearch";
import FeaturedArticles from "@/app/components/homepage/FeaturedArticles";
import { getDossiers } from "@/lib/dossier-network";
import type { DossierSummary } from "@/lib/dossier-core";
import { pageMetadata } from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Meridian — het verhaal achter de gebeurtenis",
  "Onderzoek maatschappelijke vragen via doorlopende dossiers, hoofdstukken, artikelen en bronnen.",
  "/",
);

function normalizeTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value: string) {
  return normalizeTitle(value).replace(/\s+/g, "-");
}

function findDossier(dossiers: DossierSummary[], title: string) {
  const target = normalizeTitle(title);
  return dossiers.find((dossier) => normalizeTitle(dossier.title) === target)
    ?? dossiers.find((dossier) => normalizeTitle(dossier.title).includes(target) || target.includes(normalizeTitle(dossier.title)));
}

function buildOtherResearch(dossiers: DossierSummary[]): OtherResearchItem[] {
  const preferredTitles = [
    "Datum publiek",
    "De Tweede Wereldoorlog als systeem",
    "De organisatorische netwerklaag van Gelderland",
  ];

  const items: OtherResearchItem[] = [];
  const used = new Set<string>();

  for (const title of preferredTitles) {
    const dossier = findDossier(dossiers, title);
    if (!dossier || used.has(dossier.slug)) continue;
    used.add(dossier.slug);
    items.push({
      slug: dossier.slug,
      title: dossier.title,
      description: dossier.description,
    });
  }

  for (const dossier of dossiers) {
    if (items.length >= 3) break;
    if (used.has(dossier.slug) || dossier.slug === "tegenspraak") continue;
    used.add(dossier.slug);
    items.push({
      slug: dossier.slug,
      title: dossier.title,
      description: dossier.description,
    });
  }

  return items.slice(0, 3);
}

export default async function Home() {
  const dossiers = await getDossiers();
  const otherResearch = buildOtherResearch(dossiers);

  const relatedTitles = [
    "De Tweede Wereldoorlog als systeem",
    "De organisatorische netwerklaag van Gelderland",
    "De uitgang is vol",
  ];

  const relatedDossiers = relatedTitles.map((title) => {
    const dossier = findDossier(dossiers, title);
    return {
      title,
      slug: dossier?.slug ?? slugify(title),
    };
  });

  return (
    <main>
      <ParticleHero />
      <OtherResearch items={otherResearch} />
      <FeaturedResearch relatedDossiers={relatedDossiers} />
      <FeaturedArticles />
    </main>
  );
}
