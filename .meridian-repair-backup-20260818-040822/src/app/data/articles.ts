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
];

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getFeaturedArticles() {
  return articles.filter((article) => article.featured);
}