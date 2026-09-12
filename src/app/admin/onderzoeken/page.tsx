import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";

export default async function ResearchListPage() {
  const { supabase } = await requireEditorialUser();
  const { data: items } = await supabase
    .from("content_items")
    .select("id,slug,title,summary,status,featured,updated_at,research_dossiers(central_question)")
    .eq("content_type", "research")
    .order("updated_at", { ascending: false });

  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-10">
      <div className="flex flex-col justify-between gap-5 border-b border-[#102534]/10 pb-7 md:flex-row md:items-end">
        <div><p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#9a6748]">Onderzoekslaag</p><h1 className="mt-2 font-serif text-5xl tracking-[-0.04em]">Onderzoeken</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#102534]/50">Beheer de centrale vraag, methode en leesblokken. Artikelen blijven aparte publicaties en kunnen vanuit een onderzoek worden verbonden.</p></div>
        <Link href="/admin/onderzoeken/nieuw" className="self-start rounded-sm bg-[#102534] px-4 py-3 text-xs text-white no-underline">+ Nieuw onderzoek</Link>
      </div>

      <div className="mt-7 grid gap-4 xl:grid-cols-2">
        {items?.map((item) => {
          const relation = Array.isArray(item.research_dossiers) ? item.research_dossiers[0] : item.research_dossiers;
          return (
            <Link key={item.id} href={`/admin/content/${item.id}`} className="group rounded-sm border border-[#102534]/10 bg-white p-5 text-inherit no-underline transition hover:border-[#102534]/25 md:p-6">
              <div className="flex items-center justify-between gap-4"><span className="text-[0.65rem] uppercase tracking-[0.16em] text-[#9a6748]">{item.status.replaceAll("_", " ")}</span>{item.featured && <span className="rounded-full bg-[#102534] px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.12em] text-white">Homepage</span>}</div>
              <h2 className="mt-5 font-serif text-3xl leading-tight tracking-[-0.025em] group-hover:underline group-hover:underline-offset-4">{item.title}</h2>
              {relation?.central_question && <p className="mt-4 text-sm leading-6 text-[#102534]/60"><span className="text-[#102534]/35">Vraag — </span>{relation.central_question}</p>}
              {item.summary && <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#102534]/45">{item.summary}</p>}
              <div className="mt-7 flex items-center justify-between border-t border-[#102534]/8 pt-4 text-xs text-[#102534]/45"><span>/{item.slug}</span><span className="text-[#102534]">Bewerk →</span></div>
            </Link>
          );
        })}
        {!items?.length && <p className="rounded-sm border border-dashed border-[#102534]/20 p-8 text-sm text-[#102534]/45">Nog geen onderzoeken.</p>}
      </div>
    </div>
  );
}
