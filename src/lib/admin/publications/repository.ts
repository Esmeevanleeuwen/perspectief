import "server-only";
import { requireEditorialUser } from "@/lib/admin/roles";
import { PUBLICATIONS_PAGE_SIZE, type PublicationFilters, type PublicationsResult } from "./model";
import { publicationsQuery, toPublication } from "./query";

/** Every read checks the current user's editorial access, including reuse in another module. */
export async function getPublications(filters: PublicationFilters): Promise<PublicationsResult> {
  const { supabase, role } = await requireEditorialUser();
  // Match is_editorial() without widening the existing database permissions.
  const canChangeStatus = role === "owner" || role === "editor";
  try {
    let page = filters.page;
    let result = await publicationsQuery(supabase, filters, page);
    // PostgREST can reject a stale range after records have been removed.
    if (result.status === 416) {
      page = 1;
      result = await publicationsQuery(supabase, filters, page);
    }
    if (result.error) return { ok: false, message: "Publicaties laden lukte niet. Probeer het opnieuw." };
    const total = result.count ?? 0;
    const lastPage = Math.max(1, Math.ceil(total / PUBLICATIONS_PAGE_SIZE));
    if (page > lastPage) {
      page = lastPage;
      result = await publicationsQuery(supabase, filters, page);
      if (result.error) return { ok: false, message: "Publicaties laden lukte niet. Probeer het opnieuw." };
    }
    return { ok: true, items: (result.data ?? []).map(row => ({ ...toPublication(row), canChangeStatus })), total: result.count ?? 0, page, pageSize: PUBLICATIONS_PAGE_SIZE };
  } catch {
    return { ok: false, message: "Publicaties laden lukte niet. Probeer het opnieuw." };
  }
}
