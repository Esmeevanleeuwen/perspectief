import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";
import { publicContentHref } from "@/lib/admin/content";

export default async function AdminPage() {
  const { supabase } = await requireEditorialUser();

  const [all, published, research, draft, recent] = await Promise.all([
    supabase.from("content_items").select("*", { count: "exact", head: true }),
    supabase.from("content_items").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("content_items").select("*", { count: "exact", head: true }).eq("content_type", "research"),
    supabase.from("content_items").select("*", { count: "exact", head: true }).in("status", ["draft", "researching", "source_check", "editorial_review", "ready"]),
    supabase.from("content_items").select("id,slug,title,content_type,status,updated_at").order("updated_at", { ascending: false }).limit(6),
  ]);

  const stats = [
    ["Alle content", all.count ?? 0],
    ["Gepubliceerd", published.count ?? 0],
    ["Onderzoeken", research.count ?? 0],
    ["In bewerking", draft.count ?? 0],
  ];

  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-10">
      <div className="flex flex-col justify-between gap-6 border-b border-[#102534]/10 pb-9 md:flex-row md:items-end">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#9a6748]">Redactioneel systeem</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-none tracking-[-0.04em] md:text-6xl">Eén plek voor wat Meridian publiceert.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#102534]/55">Beheer artikelen en onderzoeken hier. Wat je publiceert verschijnt via dezelfde contentlaag op de publieke site.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/content/nieuw" className="rounded-sm bg-[#102534] px-4 py-3 text-xs font-medium text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a6748]">Nieuwe publicatie</Link>
          <Link href="/admin/onderzoeken/nieuw" className="rounded-sm border border-[#102534]/15 bg-white px-4 py-3 text-xs no-underline hover:border-[#102534]/35">Nieuw onderzoek</Link>
        </div>
      </div>

      <section className="grid gap-px border border-[#102534]/10 bg-[#102534]/10 sm:grid-cols-2 xl:grid-cols-4" aria-label="Contentstatistieken">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-white p-5 md:p-6"><p className="text-xs text-[#102534]/45">{label}</p><p className="mt-5 font-serif text-4xl">{value}</p></div>
        ))}
      </section>

      <section className="mt-10 rounded-sm border border-[#102534]/10 bg-white">
        <header className="flex items-center justify-between border-b border-[#102534]/10 px-5 py-4 md:px-6">
          <div><p className="text-[0.65rem] uppercase tracking-[0.18em] text-[#9a6748]">Recent</p><h2 className="mt-1 font-serif text-2xl">Laatst gewijzigd</h2></div>
          <Link href="/admin/content" className="text-xs underline-offset-4 hover:underline">Alles beheren →</Link>
        </header>
        <div>
          {recent.data?.map((item) => (
            <div key={item.id} className="grid gap-3 border-b border-[#102534]/8 px-5 py-4 last:border-0 md:grid-cols-[minmax(0,1fr)_120px_120px] md:items-center md:px-6">
              <div className="min-w-0"><Link href={`/admin/content/${item.id}`} className="font-medium no-underline hover:underline">{item.title}</Link><p className="mt-1 text-xs text-[#102534]/40">/{item.slug}</p></div>
              <span className="text-xs capitalize text-[#102534]/55">{item.status.replaceAll("_", " ")}</span>
              {item.status === "published" ? <Link href={publicContentHref(item.content_type, item.slug)} target="_blank" className="text-xs underline-offset-4 hover:underline">Open publiek ↗</Link> : <span className="text-xs text-[#102534]/30">Niet publiek</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
