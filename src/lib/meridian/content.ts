import { createClient } from "@/lib/supabase/server";

export async function getDbContentBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .select(`
      *,
      content_sections(*),
      research_dossiers(*),
      content_claims(
        role,
        position,
        claims(*)
      ),
      content_nodes(
        role,
        position,
        knowledge_nodes(*)
      )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getDbContentBySlug error:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  if (data.content_sections) {
    data.content_sections.sort(
      (a: { position: number }, b: { position: number }) =>
        a.position - b.position
    );
  }

  return data;
}

export async function getPublishedDbResearch() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .select(`
      id,
      slug,
      title,
      eyebrow,
      summary,
      hero_image,
      featured,
      status,
      updated_at,
      research_dossiers(*)
    `)
    .eq("content_type", "research")
    .eq("status", "published")
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error("getPublishedDbResearch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublishedDbArticles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .select(`
      id,
      slug,
      content_type,
      title,
      eyebrow,
      summary,
      hero_image,
      featured,
      featured_position,
      published_at,
      updated_at
    `)
    .in("content_type", [
      "article",
      "analysis",
      "case"
    ])
    .eq("status", "published")
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error("getPublishedDbArticles error:", error);
    return [];
  }

  return data ?? [];
}