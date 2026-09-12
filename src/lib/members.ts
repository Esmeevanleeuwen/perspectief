import { requireUser } from "@/lib/auth/user";
export type MemberPublication = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  kind: "article" | "text";
  audience: "members" | "selected";
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
};
export type Member = {
  id: string;
  display_name: string | null;
  email: string;
  created_at: string;
  total_count: number;
};
export const publicationFields =
  "id,slug,title,summary,kind,audience,status,published_at,updated_at";
export const publicationHref = (slug: string) =>
  `/account/bibliotheek/${encodeURIComponent(slug)}`;
export function pageNumber(value?: string) {
  return Math.max(1, Math.min(10000, Number.parseInt(value ?? "1", 10) || 1));
}
export async function memberLibrary(query = "", page = 1, personal = false) {
  const { supabase } = await requireUser("/account/bibliotheek");
  let request = supabase
    .from("member_publications")
    .select(publicationFields, { count: "exact" })
    .eq("status", "published");
  if (query)
    request = request.ilike(
      "title",
      `%${query.slice(0, 100).replace(/[%_]/g, "\\$&")}%`,
    );
  if (personal) request = request.eq("audience", "selected");
  return request
    .order("published_at", { ascending: false })
    .order("id")
    .range((page - 1) * 12, page * 12 - 1);
}
