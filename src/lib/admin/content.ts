import { createClient } from "@/lib/supabase/server";

export async function getPublishedContentBySlug(slug: string, type?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("content_items")
    .select(`
      *,
      content_sections(*),
      content_claims(role, claims(*)),
      content_sources(role, sources(*)),
      research_dossiers(*)
    `)
    .eq("slug", slug)
    .eq("status", "published");

  if (type) query = query.eq("content_type", type);

  const { data } = await query.maybeSingle();
  return data;
}

export async function getPublishedArticles() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_items")
    .select("id,slug,title,summary,hero_image,published_at,content_type")
    .in("content_type", ["article", "analysis", "case"])
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return data ?? [];
}
