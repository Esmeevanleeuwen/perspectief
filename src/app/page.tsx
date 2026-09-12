import ParticleHero from "@/app/components/homepage/ParticleHero";
import OtherResearch, { type OtherResearchItem } from "@/app/components/homepage/OtherResearch";
import FeaturedResearch from "@/app/components/homepage/FeaturedResearch";
import FeaturedArticles from "@/app/components/homepage/FeaturedArticles";
import CurrentDevelopments from "@/app/components/homepage/CurrentDevelopments";
import { getDossiers } from "@/lib/dossier-network";
import type { DossierSummary } from "@/lib/dossier-core";
import { pageMetadata } from "@/components/dossiers/DossierUI";

export const revalidate = 300;
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

const researchSelections = [
  {
    title: "De Tweede Wereldoorlog als systeem",
    image: "https://images.unsplash.com/photo-1563804951831-49844db19644?q=80&w=1395&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Historische militaire omgeving als beeld bij het dossier over de Tweede Wereldoorlog als systeem.",
  },
  {
    title: "De organisatorische netwerklaag van Gelderland",
    image: "https://d3i6fh83elv35t.cloudfront.net/static/2021/04/2021-04-20T112101Z_842128517_RC2NZM9HNB9R_RTRMADP_3_CLIMATE-CHANGE-EU-LAW-768x509.jpg",
    imageAlt: "Europese bestuurlijke context als beeld bij het dossier over organisatorische netwerken.",
  },
  {
    title: "De uitgang is vol",
    image: "https://cihrs.org/wp-content/uploads/2020/05/%D9%85%D8%B9%D8%A8%D8%B1-%D9%81%D9%84%D8%B3%D8%B7%D9%8A%D9%86-862x485.jpg",
    imageAlt: "Afgesloten doorgang als beeld bij het dossier De uitgang is vol.",
  },
] as const;

function buildOtherResearch(dossiers: DossierSummary[]): OtherResearchItem[] {
  return researchSelections.map((selection) => {
    const dossier = findDossier(dossiers, selection.title);
    return {
      slug: dossier?.slug ?? slugify(selection.title),
      title: dossier?.title ?? selection.title,
      description: dossier?.description ?? "Open het dossier om de bronnen, verbanden en onderzoeksvragen te bekijken.",
      image: selection.image,
      imageAlt: selection.imageAlt,
    };
  });
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
      <CurrentDevelopments />
    </main>
  );
}
