import { cache } from "react";
import { research } from "@/app/data/research";
import { getArticlesForResearch } from "@/app/data/articles";
import { pilotDossier } from "@/lib/pilot-dossier";
import {
  uniqueChapters,
  type Dossier,
  type DossierChapter,
  type DossierDocumentSummary,
  type DossierLink,
  type DossierPlatform,
  type DossierSummary,
  type SharedClaim,
  type SourceDocument,
} from "@/lib/dossier-core";

const PLATFORM: DossierPlatform = "meridian";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function number(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function endpoint() {
  const explicit = process.env.DOSSIER_CORE_API_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return projectUrl ? `${projectUrl.replace(/\/$/, "")}/functions/v1/dossier-core` : "";
}

function apiKey() {
  return (
    process.env.DOSSIER_CORE_API_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ""
  ).trim();
}

async function requestCore(params: Record<string, string>, tag: string): Promise<Record<string, unknown> | null> {
  const url = endpoint();
  const key = apiKey();
  if (!url || !key) return null;

  try {
    const query = new URLSearchParams({ platform: PLATFORM, ...params });
    const response = await fetch(`${url}?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        Accept: "application/json",
      },
      next: {
        revalidate: 300,
        tags: ["dossier-core", tag],
      },
    });

    if (!response.ok) return null;
    const payload: unknown = await response.json();
    return object(payload);
  } catch {
    return null;
  }
}

function summaryFromApi(value: unknown): DossierSummary | null {
  const item = object(value);
  const core = object(item.core);
  const view = object(item.view);
  const slug = text(core.slug);
  const title = text(view.title) || text(core.title);

  if (!SLUG_PATTERN.test(slug) || !title) return null;

  return {
    id: text(core.id) || undefined,
    slug,
    coreTitle: text(core.title) || title,
    title,
    description: text(view.summary) || text(core.summary),
    themes: strings(core.themes),
    status: text(view.status_label) || text(core.shared_status) || "Onderzoeksdossier",
    indexable: view.indexable === true,
    updatedAt: text(view.updated_at) || text(core.updated_at) || undefined,
    sourceOwner: text(core.source_owner) || undefined,
    availableOn: strings(item.available_on)
      .filter((platform): platform is DossierPlatform => platform === "meridian" || platform === "ampara"),
    presentationState: text(view.state) || undefined,
  };
}

function chapterFromApi(value: unknown, index: number): DossierChapter | null {
  const row = object(value);
  const id = text(row.id) || `hoofdstuk-${index + 1}`;
  const title = text(row.title) || text(row.heading);
  const paragraphs = strings(row.body).length
    ? strings(row.body)
    : strings(row.paragraphs);

  if (!SLUG_PATTERN.test(id) || !title || !paragraphs.length) return null;

  return {
    id,
    title,
    paragraphs,
    points: strings(row.points),
    eyebrow: text(row.eyebrow) || undefined,
    kind: text(row.type) || undefined,
    position: number(row.position) || index + 1,
  };
}

function articleFromApi(value: unknown): DossierLink | null {
  const row = object(value);
  const title = text(row.title);
  const href = text(row.href);
  if (!title || !href.startsWith("/artikelen/")) return null;
  return {
    title,
    href,
    description: text(row.description),
  };
}

function documentFromApi(value: unknown): DossierDocumentSummary | null {
  const row = object(value);
  const slug = text(row.document_slug) || text(row.slug);
  const title = text(row.title);
  if (!SLUG_PATTERN.test(slug) || !title) return null;

  return {
    id: text(row.source_document_id) || text(row.id) || slug,
    slug,
    title,
    description: text(row.description) || null,
    role: text(row.role) || undefined,
    pageCount: number(row.page_count),
    sectionCount: number(row.section_count),
  };
}

function claimFromApi(value: unknown): SharedClaim | null {
  const row = object(value);
  const statement = text(row.statement);
  if (!statement) return null;
  return {
    id: text(row.id) || statement,
    statement,
    validFrom: text(row.valid_from) || undefined,
    validTo: text(row.valid_to) || undefined,
  };
}

const localDossiers: Dossier[] = research.map((item) => ({
  slug: item.slug,
  title: item.title,
  description: item.summary,
  themes: ["Bestuur", "Transparantie"],
  status: "Doorlopend onderzoek",
  indexable: true,
  question: item.question,
  introduction: item.summary,
  method: item.method,
  boundaries: "Onderzoeksvragen, ervaringen en verklaringen zijn geen automatische feitenvaststelling. Ontbrekende bronnen blijven zichtbaar.",
  chapters: uniqueChapters(item.sections.map((section, index) => ({
    id: section.id,
    title: section.title,
    paragraphs: [...(section.intro ? [section.intro] : []), ...section.paragraphs],
    points: section.points,
    eyebrow: section.eyebrow,
    position: index + 1,
  }))),
  articles: getArticlesForResearch(item.slug).map((article) => ({
    title: article.title,
    description: article.description,
    href: `/artikelen/${article.slug}`,
  })),
}));

const localIndex = [...localDossiers, pilotDossier];

export const getDossiers = cache(async (): Promise<DossierSummary[]> => {
  const payload = await requestCore({}, "dossier-catalogue:meridian");
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const dossiers = items
    .map(summaryFromApi)
    .filter((item): item is DossierSummary => Boolean(item));

  return dossiers.length ? dossiers : localIndex;
});

export const getDossier = cache(async (slug: string): Promise<Dossier | undefined> => {
  if (!SLUG_PATTERN.test(slug)) return undefined;

  const payload = await requestCore({ slug }, `dossier:${slug}:meridian`);
  const bundle = object(payload?.dossier);
  const core = object(bundle.core);
  const view = object(bundle.view);
  const shared = object(bundle.shared);
  const summary = summaryFromApi({ core, view, available_on: bundle.available_on });

  if (!summary) return localIndex.find((dossier) => dossier.slug === slug);

  const chapters = uniqueChapters(
    (Array.isArray(view.sections) ? view.sections : [])
      .map(chapterFromApi)
      .filter((item): item is DossierChapter => Boolean(item)),
  );

  const articles = (Array.isArray(view.article_links) ? view.article_links : [])
    .map(articleFromApi)
    .filter((item): item is DossierLink => Boolean(item));

  const documents = (Array.isArray(shared.documents) ? shared.documents : [])
    .map(documentFromApi)
    .filter((item): item is DossierDocumentSummary => Boolean(item));

  const claims = (Array.isArray(shared.claims) ? shared.claims : [])
    .map(claimFromApi)
    .filter((item): item is SharedClaim => Boolean(item));

  return {
    ...summary,
    question: text(view.question) || summary.description,
    introduction: text(view.introduction) || summary.description,
    method: text(view.methodology) || "Bronnen, claims, gebeurtenissen en onzekerheden worden afzonderlijk beoordeeld.",
    boundaries: text(view.boundaries) || "Wat niet aantoonbaar is, blijft zichtbaar als open vraag.",
    chapters,
    articles,
    documents,
    claims,
    presentation: object(view.presentation),
  };
});

export const getSourcesForDossier = cache(async (slug: string): Promise<SourceDocument[]> => {
  const dossier = await getDossier(slug);
  if (!dossier) return [];

  return (dossier.documents ?? []).map((document) => ({
    id: document.id,
    slug: document.slug,
    title: document.title,
    description: document.description,
    role: document.role,
    pageCount: document.pageCount,
    sectionCount: document.sectionCount,
    dossiers: [dossier],
    sections: [],
    pages: [],
  }));
});

export const getSources = cache(async (): Promise<SourceDocument[]> => {
  const dossiers = await getDossiers();
  const details = await Promise.all(dossiers.map((dossier) => getDossier(dossier.slug)));
  const documents = new Map<string, SourceDocument>();

  for (const dossier of details) {
    if (!dossier) continue;
    for (const item of dossier.documents ?? []) {
      const existing = documents.get(item.slug);
      if (existing) {
        if (!existing.dossiers.some((linked) => linked.slug === dossier.slug)) {
          existing.dossiers.push(dossier);
        }
        continue;
      }
      documents.set(item.slug, {
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        role: item.role,
        pageCount: item.pageCount,
        sectionCount: item.sectionCount,
        dossiers: [dossier],
        sections: [],
        pages: [],
      });
    }
  }

  return [...documents.values()].sort((a, b) => a.title.localeCompare(b.title, "nl"));
});

export const getSource = cache(async (slug: string): Promise<SourceDocument | undefined> => {
  if (!SLUG_PATTERN.test(slug)) return undefined;

  const payload = await requestCore({ document: slug }, `document:${slug}:meridian`);
  const document = object(payload?.document);
  if (!text(document.slug) || !text(document.title)) return undefined;

  const dossiers = (Array.isArray(document.dossiers) ? document.dossiers : [])
    .map(summaryFromApi)
    .filter((item): item is DossierSummary => Boolean(item));

  return {
    id: text(document.source_document_id) || slug,
    slug: text(document.slug),
    title: text(document.title),
    description: text(document.description) || null,
    importedAt: text(document.imported_at) || undefined,
    pageCount: number(document.page_count),
    sectionCount: number(document.section_count),
    dossiers,
    sections: (Array.isArray(document.sections) ? document.sections : []).flatMap((value) => {
      const row = object(value);
      const title = text(row.title);
      const pageNumber = number(row.page_number);
      if (!title || pageNumber < 1) return [];
      return [{
        id: text(row.id) || `${slug}-${pageNumber}-${title}`,
        title,
        pageNumber,
        level: Math.max(1, number(row.level)),
      }];
    }),
    pages: (Array.isArray(document.pages) ? document.pages : []).flatMap((value) => {
      const row = object(value);
      const pageNumber = number(row.page_number);
      if (pageNumber < 1) return [];
      return [{
        id: text(row.id) || `${slug}-${pageNumber}`,
        pageNumber,
        text: text(row.extracted_text),
        reviewStatus: text(row.review_status),
      }];
    }),
  };
});

export const getArticleDossiers = cache(async (slug: string): Promise<DossierSummary[]> => {
  const href = `/artikelen/${encodeURIComponent(slug)}`;
  const dossiers = await getDossiers();
  const details = await Promise.all(dossiers.map((dossier) => getDossier(dossier.slug)));

  return details.filter(
    (dossier): dossier is Dossier => Boolean(dossier?.articles.some((article) => article.href === href)),
  );
});
