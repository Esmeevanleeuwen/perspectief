import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";
import { publicContentHref } from "@/lib/admin/content";

type Props = { searchParams: Promise<{ q?: string; type?: string; status?: string; deleted?: string }> };

export default async function ContentPage({ searchParams }: Props) {
  const filters = await searchParams;
  const { supabase } = await requireEditorialUser();
  let query = supabase.from("content_items").select("id,slug,title,content_type,status,featured,updated_at").order("updated_at", { ascending: false });

  if (filters.q?.trim()) query = query.ilike("title", `%${filters.q.trim()}%`);
  if (filters.type?.trim()) query = query.eq("content_type", filters.type.trim());
  if (filters.status?.trim()) query = query.eq("status", filters.status.trim());

  const { data: items } = await query;

  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-10">
      <div className="flex flex-col justify-between gap-5 border-b border-[#102534]/10 pb-7 md:flex-row md:items-end">
        <div><p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#9a6748]">Bibliotheek</p><h1 className="mt-2 font-serif text-5xl tracking-[-0.04em]">Publicaties</h1></div>
        <Link href="/admin/content/nieuw" className="self-start rounded-sm bg-[#102534] px-4 py-3 text-xs text-white no-underline">+ Nieuwe publicatie</Link>
      </div>

      {filters.deleted && <p role="status" className="mt-5 rounded-sm border border-emerald-800/15 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Publicatie verwijderd.</p>}

      <form className="mt-6 grid gap-3 rounded-sm border border-[#102534]/10 bg-white p-4 md:grid-cols-[1fr_170px_190px_auto]" action="/admin/content">
        <label className="sr-only" htmlFor="content-search">Zoeken op titel</label>
        <input id="content-search" name="q" defaultValue={filters.q ?? ""} placeholder="Zoek op titel…" className="min-h-11 rounded-sm border border-[#102534]/12 bg-white px-3 text-sm outline-none focus:border-[#102534]/45 focus:ring-2 focus:ring-[#9a6748]/15" />
        <select name="type" defaultValue={filters.type ?? ""} aria-label="Filter op type" className="min-h-11 rounded-sm border border-[#102534]/12 bg-white px-3 text-sm outline-none focus:border-[#102534]/45">
          <option value="">Alle types</option><option value="article">Artikel</option><option value="analysis">Analyse</option><option value="case">Casus</option><option value="research">Onderzoek</option>
        </select>
        <select name="status" defaultValue={filters.status ?? ""} aria-label="Filter op status" className="min-h-11 rounded-sm border border-[#102534]/12 bg-white px-3 text-sm outline-none focus:border-[#102534]/45">
          <option value="">Alle statussen</option><option value="published">Gepubliceerd</option><option value="draft">Concept</option><option value="researching">Onderzoek</option><option value="source_check">Broncheck</option><option value="editorial_review">Redactiecheck</option><option value="ready">Klaar</option><option value="archived">Archief</option>
        </select>
        <button className="min-h-11 rounded-sm border border-[#102534]/15 px-4 text-xs font-medium hover:bg-[#102534]/4">Filter</button>
      </form>

      <div className="mt-6 overflow-hidden rounded-sm border border-[#102534]/10 bg-white">
        <div className="hidden grid-cols-[110px_minmax(0,1fr)_120px_90px_130px] gap-4 border-b border-[#102534]/10 bg-[#f7f8f8] px-5 py-3 text-[0.64rem] uppercase tracking-[0.14em] text-[#102534]/40 md:grid">
          <span>Type</span><span>Titel</span><span>Status</span><span>Home</span><span>Acties</span>
        </div>
        {items?.length ? items.map((item) => (
          <div key={item.id} className="grid gap-3 border-b border-[#102534]/8 px-5 py-5 last:border-0 md:grid-cols-[110px_minmax(0,1fr)_120px_90px_130px] md:items-center md:gap-4 md:py-4">
            <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#9a6748]">{item.content_type}</span>
            <div className="min-w-0"><Link href={`/admin/content/${item.id}`} className="font-medium no-underline hover:underline">{item.title}</Link><p className="mt-1 truncate text-xs text-[#102534]/35">/{item.slug}</p></div>
            <span className="text-xs capitalize text-[#102534]/55">{item.status.replaceAll("_", " ")}</span>
            <span className="text-xs text-[#102534]/50">{item.featured ? "Uitgelicht" : "—"}</span>
            <div className="flex gap-3 text-xs"><Link href={`/admin/content/${item.id}`} className="underline-offset-4 hover:underline">Bewerk</Link>{item.status === "published" && <Link href={publicContentHref(item.content_type, item.slug)} target="_blank" className="underline-offset-4 hover:underline">Bekijk ↗</Link>}</div>
          </div>
        )) : <p className="px-5 py-12 text-center text-sm text-[#102534]/45">Geen content gevonden met deze filters.</p>}
      </div>
    </div>
  );
}
