import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";

export default async function AdminPage() {
  const { supabase } = await requireEditorialUser();

  const [{ count: contentCount }, { count: researchCount }] = await Promise.all([
    supabase.from("content_items").select("*", { count: "exact", head: true }),
    supabase.from("content_items").select("*", { count: "exact", head: true }).eq("content_type", "research"),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-10">
      <p className="text-xs uppercase tracking-[0.2em] text-[#9a6748]">Redactioneel systeem</p>
      <h1 className="mt-4 font-serif text-6xl tracking-[-0.04em]">Bouw eerst de kennis.</h1>

      <div className="mt-12 grid gap-px bg-[#102534]/10 md:grid-cols-4">
        <Card href="/admin/content/nieuw" title="Nieuwe publicatie" />
        <Card href="/admin/onderzoeken/nieuw" title="Nieuw onderzoek" />
        <Card href="/admin/content" title={`${contentCount ?? 0} content-items`} />
        <Card href="/admin/onderzoeken" title={`${researchCount ?? 0} onderzoeken`} />
      </div>
    </div>
  );
}

function Card({ href, title }: { href: string; title: string }) {
  return <Link href={href} className="min-h-44 bg-[#fbf8f3] p-7 text-inherit no-underline"><h2 className="font-serif text-2xl">{title}</h2></Link>;
}
