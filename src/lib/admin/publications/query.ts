import type { SupabaseClient } from "@supabase/supabase-js";
import { PUBLICATIONS_PAGE_SIZE, type Publication, type PublicationFilters } from "./model";

export type PublicationRecord = {
  id: string; title: string; slug: string; content_type: string; status: string;
  featured: boolean; featured_position: string | null; updated_at: string;
};

export function toPublication(row: PublicationRecord): Publication {
  return {
    id: row.id, title: row.title, slug: row.slug,
    type: row.content_type, status: row.status,
    placement: { featured: row.featured, position: row.featured_position },
    updatedAt: row.updated_at,
  };
}

/** Compose optional filters; no implicit published-only or homepage-only restriction. */
export function publicationsQuery(client: SupabaseClient, filters: PublicationFilters, page = filters.page) {
  let query = client.from("content_items")
    .select("id,slug,title,content_type,status,featured,featured_position,updated_at", { count: "exact" });
  if (filters.q) {
    const literal = filters.q.replace(/[\\%_]/g, "\\$&");
    query = query.ilike("title", `%${literal}%`);
  }
  if (filters.type) query = query.eq("content_type", filters.type);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.placement) query = query.eq("featured", filters.placement === "featured");
  const offset = (page - 1) * PUBLICATIONS_PAGE_SIZE;
  return query.order("updated_at", { ascending: false }).order("id", { ascending: true })
    .range(offset, offset + PUBLICATIONS_PAGE_SIZE - 1);
}
