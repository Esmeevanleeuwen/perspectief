export type DossierPlatform = "meridian" | "ampara";

export type DossierChapter = {
  id: string;
  title: string;
  paragraphs: string[];
  points?: string[];
  eyebrow?: string;
  kind?: string;
  position?: number;
};

export type SharedClaim = {
  id: string;
  statement: string;
  validFrom?: string;
  validTo?: string;
};

export type DossierDocumentSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  role?: string;
  pageCount: number;
  sectionCount: number;
};

export type DossierSummary = {
  slug: string;
  title: string;
  description: string;
  themes: string[];
  status: string;
  indexable: boolean;
  id?: string;
  coreTitle?: string;
  updatedAt?: string;
  sourceOwner?: string;
  availableOn?: DossierPlatform[];
  presentationState?: string;
};

export type DossierLink = {
  title: string;
  href: string;
  description: string;
};

export type Dossier = DossierSummary & {
  question: string;
  method: string;
  boundaries: string;
  chapters: DossierChapter[];
  articles: DossierLink[];
  introduction?: string;
  documents?: DossierDocumentSummary[];
  claims?: SharedClaim[];
  presentation?: Record<string, unknown>;
  externalSources?: DossierLink[];
  evidence?: {
    established: number;
    disputed: number;
    unknown: number;
  };
};

export type SourceDocument = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  dossiers: DossierSummary[];
  sections: {
    id: string;
    title: string;
    pageNumber: number;
    level: number;
  }[];
  pages: {
    id: string;
    pageNumber: number;
    text: string;
    reviewStatus: string;
  }[];
  role?: string;
  pageCount?: number;
  sectionCount?: number;
  importedAt?: string;
};

export function topicSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getTopics(dossiers: DossierSummary[]) {
  const topics = new Map<string, {
    slug: string;
    title: string;
    dossiers: DossierSummary[];
  }>();

  for (const dossier of dossiers) {
    for (const title of dossier.themes) {
      const slug = topicSlug(title);
      if (!slug) continue;
      const topic = topics.get(slug) ?? { slug, title, dossiers: [] };
      if (!topic.dossiers.some((item) => item.slug === dossier.slug)) {
        topic.dossiers.push(dossier);
      }
      topics.set(slug, topic);
    }
  }

  return [...topics.values()].sort((a, b) => a.title.localeCompare(b.title, "nl"));
}

export function relatedDossiers(current: DossierSummary, all: DossierSummary[], limit = 4) {
  const currentThemes = new Set(current.themes.map(topicSlug));

  return all
    .filter((item) => item.slug !== current.slug)
    .map((item) => {
      const shared = [...new Map(
        item.themes
          .filter((theme) => currentThemes.has(topicSlug(theme)))
          .map((theme) => [topicSlug(theme), theme]),
      ).values()];

      return {
        ...item,
        shared,
        score: shared.length / Math.max(
          1,
          new Set([...currentThemes, ...item.themes.map(topicSlug)]).size,
        ),
      };
    })
    .filter((item) => item.shared.length > 0)
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .slice(0, limit);
}

export function uniqueChapters(chapters: DossierChapter[]): DossierChapter[] {
  const seen = new Set<string>();

  return chapters
    .filter((chapter) => {
      if (
        !chapter.id ||
        !chapter.title ||
        seen.has(chapter.id) ||
        !chapter.paragraphs.some((text) => text.trim())
      ) {
        return false;
      }
      seen.add(chapter.id);
      return true;
    })
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export const dossierPath = (slug: string) => `/dossiers/${encodeURIComponent(slug)}`;
export const chapterPath = (slug: string, chapter: string) =>
  `${dossierPath(slug)}/hoofdstukken/${encodeURIComponent(chapter)}`;
export const sourcePath = (slug: string) => `/bronnen/${encodeURIComponent(slug)}`;
export const pageAnchor = (documentSlug: string, number: number) =>
  `document-${documentSlug}-page-${number}`;
export function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
