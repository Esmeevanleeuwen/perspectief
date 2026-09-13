import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";
import AdminPageHeading from "@/components/admin/AdminPageHeading";
import AdminContentList from "@/components/admin/AdminContentList";

type Props = { searchParams: Promise<{ q?: string; type?: string; status?: string; deleted?: string }> };

export default async function ContentPage({ searchParams }: Props) {
  const filters = await searchParams;
  const { supabase } = await requireEditorialUser();
  let query = supabase.from("content_items").select("id,slug,title,content_type,status,featured,updated_at").order("updated_at", { ascending: false });
  if (filters.q?.trim()) query = query.ilike("title", `%${filters.q.trim()}%`);
  if (filters.type?.trim()) query = query.eq("content_type", filters.type.trim());
  if (filters.status?.trim()) query = query.eq("status", filters.status.trim());
  const { data: items, error } = await query;

  return (
    <div className="admin-page">
      <AdminPageHeading title="Publicaties" description="Beheer de verhalen en artikelen van Meridian.">
        <Link href="/admin/content/nieuw" className="member-button">+ Nieuwe publicatie</Link>
      </AdminPageHeading>
      {filters.deleted && <p role="status" className="member-notice">Publicatie verwijderd.</p>}
      <form className="member-search admin-content-filters" action="/admin/content">
        <label className="member-grow">Zoek publicatie<input name="q" type="search" defaultValue={filters.q ?? ""} placeholder="Zoek op titel…" /></label>
        <label>Type<select name="type" defaultValue={filters.type ?? ""}>
          <option value="">Alle types</option><option value="article">Artikel</option><option value="analysis">Analyse</option><option value="case">Casus</option><option value="research">Onderzoek</option>
        </select></label>
        <label>Status<select name="status" defaultValue={filters.status ?? ""}>
          <option value="">Alle statussen</option><option value="idea">Idee</option><option value="published">Gepubliceerd</option><option value="draft">Concept</option><option value="researching">In onderzoek</option><option value="source_check">Broncheck</option><option value="editorial_review">Redactiecheck</option><option value="ready">Klaar voor publicatie</option><option value="archived">Gearchiveerd</option>
        </select></label>
        <button className="member-secondary">Filteren</button>
      </form>
      {error ? (
        <p role="alert" className="member-notice member-error">Publicaties laden lukte niet. Probeer de pagina opnieuw te openen.</p>
      ) : items?.length ? (
        <AdminContentList items={items} />
      ) : (
        <div className="member-empty"><h2>Geen publicaties gevonden</h2><p>Pas je filters aan of maak een nieuwe publicatie.</p></div>
      )}
    </div>
  );
}
