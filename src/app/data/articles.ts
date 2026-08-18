export type ArticleBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "heading";
      text: string;
    };

export type Article = {
  slug: string;
  researchSlug?: string;
  label: string;
  title: string;
  description: string;
  image: string;
  experiences: number;
  experts: number;
  provinces?: number;
  date: string;
  featured: boolean;
  featuredPosition?: "main" | "side";
  content: ArticleBlock[];
};

export const articles: Article[] = [
  {
    slug: "prestatiedruk",
    label: "ONDERZOEK",
    title: "Waarom ervaren steeds meer jongeren prestatiedruk?",
    description:
      "Een onderzoek naar de ervaringen van jongeren, de terugkerende patronen en de mogelijke oorzaken.",
    image: "/artikelsad.jpg",
    experiences: 438,
    experts: 12,
    provinces: 11,
    date: "18 juli 2026",
    featured: true,
    featuredPosition: "main",
    content: [
      {
        type: "paragraph",
        text: "Steeds meer jongeren geven aan druk te ervaren om te presteren. In dit onderzoek kijken we niet alleen naar losse ervaringen, maar vooral naar de patronen die daarin terugkomen.",
      },
      {
        type: "heading",
        text: "Waar komt die druk vandaan?",
      },
      {
        type: "paragraph",
        text: "Hier komt later de verdere inhoud van het artikel.",
      },
    ],
  },
  {
    slug: "leraren-onderwijs",
    label: "ONDERZOEK",
    title: "Waarom verlaten steeds meer leraren het onderwijs?",
    description:
      "Een onderzoek naar ervaringen binnen het onderwijs en de structuren die daarachter liggen.",
    image: "/class.jpg",
    experiences: 241,
    experts: 8,
    provinces: 9,
    date: "14 juli 2026",
    featured: true,
    featuredPosition: "side",
    content: [
      {
        type: "paragraph",
        text: "Waarom verlaten leraren het onderwijs? Hier komt later de volledige tekst van het onderzoek.",
      },
    ],
  },
  {
    slug: "woningonzekerheid",
    label: "ONDERZOEK",
    title: "Waarom groeit het gevoel van woningonzekerheid?",
    description:
      "Een onderzoek naar wonen, onzekerheid en de ervaringen die daarachter liggen.",
    image: "/huis.png",
    experiences: 517,
    experts: 16,
    provinces: 12,
    date: "8 juli 2026",
    featured: true,
    featuredPosition: "side",
    content: [
      {
        type: "paragraph",
        text: "Hier komt later het volledige onderzoek naar woningonzekerheid.",
      },
    ],
  },
  {
    slug: "ceuta-mei-2021",
    researchSlug: "tegenspraak",
    label: "CASUS",
    title: "Ceuta, mei 2021: wat gebeurt er wanneer een grens beleid wordt?",
    description:
      "Een menselijke casus binnen het onderzoek naar tegenspraak, informatie en besluitvorming.",
    image: "/onderzoek-tegenspraak.jpg",
    experiences: 0,
    experts: 0,
    date: "mei 2021",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "In mei 2021 bereikten in korte tijd duizenden mensen de Spaanse enclave Ceuta. De beelden tonen niet één verklaring, maar verschillende posities binnen dezelfde gebeurtenis: mensen onderweg, grensbewaking, hulpverlening, opvang en terugkeer.",
      },
      {
        type: "heading",
        text: "Van persoon naar categorie",
      },
      {
        type: "paragraph",
        text: "Tot aan de grens is iemand onderweg. Vanaf de grens wordt diezelfde persoon ook onderdeel van juridische en bestuurlijke categorieën. Leeftijd, nationaliteit, registratie, opvang en mogelijke terugkeer veranderen welke routes vervolgens beschikbaar zijn.",
      },
      {
        type: "heading",
        text: "Wat een foto wel en niet vertelt",
      },
      {
        type: "paragraph",
        text: "De foto maakt een menselijke werkelijkheid zichtbaar, maar vertelt op zichzelf niet waarom iedere persoon vertrok, welke juridische status iemand had of welke beslissing in een individueel geval gerechtvaardigd was. Die vragen moeten met aanvullende bronnen worden onderzocht.",
      },
      {
        type: "heading",
        text: "Waarom deze casus bij het onderzoek hoort",
      },
      {
        type: "paragraph",
        text: "De casus maakt zichtbaar hoe afstand kan ontstaan tussen de taal van beleid en de ervaring van mensen. Meridian gebruikt die spanning niet als conclusie, maar als onderzoeksvraag: welke informatie bereikt besluitvormers, welke informatie is publiek beschikbaar en hoe zijn menselijke gevolgen in de uiteindelijke afweging terug te vinden?",
      },
    ],
  },
];

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getFeaturedArticles() {
  return articles.filter((article) => article.featured);
}

export function getArticlesForResearch(researchSlug: string) {
  return articles.filter((article) => article.researchSlug === researchSlug);
}
