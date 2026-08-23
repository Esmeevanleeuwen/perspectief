import Link from "next/link";
import { requireEditor } from "@/lib/auth/roles";
export default async function AdminPage(){
  const {supabase}=await requireEditor();
  const [{count:content},{count:research},{count:claims},{count:nodes}]=await Promise.all([
    supabase.from("content_items").select("*",{count:"exact",head:true}),
    supabase.from("content_items").select("*",{count:"exact",head:true}).eq("content_type","research"),
    supabase.from("claims").select("*",{count:"exact",head:true}),
    supabase.from("knowledge_nodes").select("*",{count:"exact",head:true})]);
  const cards=[['/admin/content/nieuw','Nieuwe publicatie',content??0],['/admin/content/nieuw?type=research','Nieuw onderzoek',research??0],['/admin/claims','Claims',claims??0],['/admin/graph','Knowledge nodes',nodes??0]] as const;
  return <div className="mx-auto max-w-[1400px] px-6 py-14"><p className="text-xs uppercase tracking-[0.18em] text-[#ad6540]">Beheer</p><h1 className="mt-4 max-w-4xl font-serif text-6xl tracking-[-0.04em]">Kennis eerst. Publicatie daarna.</h1><div className="mt-12 grid gap-px bg-[#102633]/10 md:grid-cols-4">{cards.map(([href,title,value])=><Link key={href} href={href} className="min-h-52 bg-[#fbfaf7] p-7 no-underline"><strong className="font-serif text-4xl font-normal">{value}</strong><h2 className="mt-8 font-serif text-2xl">{title}</h2></Link>)}</div></div>;
}
