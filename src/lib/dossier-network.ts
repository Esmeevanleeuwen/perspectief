import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { research } from "@/app/data/research";
import { getArticlesForResearch } from "@/app/data/articles";
import { pilotDossier } from "@/lib/pilot-dossier";
import { uniqueChapters, type Dossier, type DossierSummary, type DossierLink, type SourceDocument } from "@/lib/dossier-core";

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  } catch {
    return null;
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(record) : [];
}

const local: Dossier[] = research.map((item) => ({
  slug: item.slug,
  title: item.title,
  description: item.summary,
  themes: ["Bestuur", "Transparantie"],
  status: "Doorlopend onderzoek",
  indexable: true,
  question: item.question,
  method: item.method,
  boundaries: "Onderzoeksvragen, ervaringen en verklaringen zijn geen automatische feitenvaststelling. Ontbrekende bronnen blijven zichtbaar.",
  chapters: uniqueChapters(item.sections.map((section) => ({
    id: section.id,
    title: section.title,
    paragraphs: [...(section.intro ? [section.intro] : []), ...section.paragraphs],
    points: section.points,
  }))),
  articles: getArticlesForResearch(item.slug).map((article) => ({
    title: article.title,
    description: article.description,
    href: `/artikelen/${article.slug}`,
  })),
}));

const publishedRows = cache(async (): Promise<Record<string, unknown>[]> => {
  const supabase = publicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("content_items")
    .select("id,slug,title,summary,research_dossiers(*),content_sections(*),content_sources(role,sources(*))")
    .eq("content_type", "research")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  // Meridian can run before every optional dossier relation or public view is
  // available. Keep the checked local dossiers online instead of failing the
  // entire public route when that database layer is incomplete.
  if (error) return [];
  return records(data);
});

function summary(row: Record<string, unknown>): DossierSummary {
  const known = local.find((dossier) => dossier.slug === row.slug);
  return {
    slug: text(row.slug),
    title: text(row.title),
    description: text(row.summary),
    themes: known?.themes ?? [],
    status: "Gepubliceerd onderzoek",
    indexable: true,
  };
}

export const getDossiers = cache(async (): Promise<DossierSummary[]> => {
  const rows = await publishedRows();
  const all = new Map<string, DossierSummary>([...local, pilotDossier].map((item) => [item.slug, item]));

  for (const row of rows) {
    if (text(row.slug) && text(row.title)) all.set(text(row.slug), summary(row));
  }

  return [...all.values()];
});

export const getDossier = cache(async (slug: string): Promise<Dossier | undefined> => {
  const row = (await publishedRows()).find((item) => item.slug === slug);
  const localDossier = [...local, pilotDossier].find((dossier) => dossier.slug === slug);
  if (!row) return localDossier;

  const meta = record(Array.isArray(row.research_dossiers) ? row.research_dossiers[0] : row.research_dossiers);
  const sections = records(row.content_sections).sort((a, b) => Number(a.position) - Number(b.position));
  const grouped: { id: string; title: string; paragraphs: string[] }[] = [];

  for (const section of sections) {
    if (section.section_type === "void") continue;
    const title = text(section.title);
    const body = text(section.body);

    if (section.section_type === "heading" || title || !grouped.length) {
      grouped.push({
        id: text(section.id),
        title: title || (section.section_type === "heading" ? body : text(row.title)),
        paragraphs: [],
      });
    }

    if (body && !(section.section_type === "heading" && !title)) {
      grouped[grouped.length - 1].paragraphs.push(...body.split(/\n\s*\n/).filter(Boolean));
    }
  }

  const chapters = uniqueChapters(grouped);
  const sourceLinks: DossierLink[] = [];

  for (const link of records(row.content_sources)) {
    const source = record(link.sources);
    if (source.visibility === "private") continue;
    if (typeof source.status === "string" && !["published", "verified"].includes(source.status)) continue;

    try {
      const url = new URL(text(source.url));
      if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password && text(source.title)) {
        sourceLinks.push({
          title: text(source.title),
          href: url.href,
          description: "Bronverwijzing bij dit onderzoek. Controleer de inhoud en context bij de oorspronkelijke uitgever.",
        });
      }
    } catch {
      // A missing or invalid source URL is not exposed as a public link.
    }
  }

  let articleLinks: DossierLink[] = localDossier?.articles ?? [];
  const supabase = publicClient();

  if (supabase && text(row.id)) {
    const { data, error } = await supabase
      .from("research_children")
      .select("relation,content_items!child_content_id(slug,title,summary,content_type,status)")
      .eq("research_content_id", text(row.id));

    if (!error) {
      articleLinks = records(data).flatMap((relation) => {
        const child = record(relation.content_items);
        if (child.status !== "published" || !["article", "analysis", "case"].includes(text(child.content_type)) || !text(child.slug)) return [];
        return [{
          title: text(child.title),
          description: text(child.summary),
          href: `/artikelen/${encodeURIComponent(text(child.slug))}`,
        }];
      });
    }
  }

  return {
    ...summary(row),
    question: text(meta.central_question) || text(row.summary),
    method: text(meta.method) || localDossier?.method || "Volg de bronnen, afwegingen en open vragen binnen dit dossier.",
    boundaries: text(meta.boundaries) || "Controleer de bronverwijzingen en onderscheid bevindingen, interpretaties en open vragen.",
    chapters: chapters.length ? chapters : (localDossier?.chapters ?? []),
    articles: articleLinks,
    externalSources: sourceLinks,
  };
});

export const getSourcesForDossier = cache(async (_slug: string): Promise<SourceDocument[]> => []);
export const getSources = cache(async (): Promise<SourceDocument[]> => []);
export const getSource = cache(async (_slug: string): Promise<SourceDocument | undefined> => undefined);

export const getArticleDossiers = cache(async (slug: string): Promise<DossierSummary[]> => {
  const dossiers = await Promise.all((await getDossiers()).map((dossier) => getDossier(dossier.slug)));
  return dossiers.filter((dossier): dossier is Dossier => Boolean(dossier?.articles.some((article) => article.href === `/artikelen/${encodeURIComponent(slug)}`)));
});
