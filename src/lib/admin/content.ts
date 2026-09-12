import { createClient } from "@/lib/supabase/server";

export type ContentSection = {
  id: string;
  content_id: string;
  section_type: string;
  position: number;
  title: string | null;
  body: string | null;
  data: Record<string, unknown> | null;
};

export type ResearchDossier = {
  content_id: string;
  central_question: string;
  method: string | null;
  boundaries: string | null;
  dimensions: string[] | null;
  missing_information: string[] | null;
  working_theory?: string | null;
};

export type PublishedContent = {
  id: string;
  slug: string;
  content_type: string;
  title: string;
  eyebrow: string | null;
  subtitle: string | null;
  summary: string | null;
  hero_image: string | null;
  image_alt: string | null;
  status: string;
  featured: boolean;
  featured_position: "main" | "side" | null;
  published_at: string | null;
  updated_at?: string | null;
  metadata: Record<string, unknown> | null;
  content_sections?: ContentSection[];
  research_dossiers?: ResearchDossier | ResearchDossier[] | null;
};

const articleTypes = ["article", "analysis", "case"];

export function publicContentHref(contentType: string, slug: string) {
  return contentType === "research" ? `/onderzoek/${slug}` : `/artikelen/${slug}`;
}

export function mediaPath(value: string | null | undefined) {
  const path = value?.trim();
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) return path;
  return null;
}

export function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function getPublishedContentBySlug(slug: string, type?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("content_items")
      .select(`
        *,
        content_sections(*),
        research_dossiers(*)
      `)
      .eq("slug", slug)
      .eq("status", "published");

    if (type) query = query.eq("content_type", type);

    const { data, error } = await query.maybeSingle();
    if (error) return null;
    return data as PublishedContent | null;
  } catch {
    return null;
  }
}

export async function getPublishedArticles() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_items")
      .select("id,slug,title,eyebrow,subtitle,summary,hero_image,image_alt,published_at,updated_at,content_type,featured,featured_position,metadata,status")
      .in("content_type", articleTypes)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error) return [];
    return (data ?? []) as PublishedContent[];
  } catch {
    return [];
  }
}

export async function getPublishedResearch() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_items")
      .select("id,slug,title,eyebrow,subtitle,summary,hero_image,image_alt,published_at,updated_at,content_type,featured,featured_position,metadata,status")
      .eq("content_type", "research")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error) return [];
    return (data ?? []) as PublishedContent[];
  } catch {
    return [];
  }
}

export async function getFeaturedArticles() {
  const items = await getPublishedArticles();
  return items.filter((item) => item.featured);
}

export async function getFeaturedResearch() {
  const items = await getPublishedResearch();
  return items.find((item) => item.featured) ?? null;
}
