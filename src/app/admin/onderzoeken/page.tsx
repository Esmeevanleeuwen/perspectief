import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";

export default async function ResearchListPage() {
  const { supabase } = await requireEditorialUser();
  const { data: items } = await supabase.from("content_items").select("*").eq("content_type", "research").order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10">
      <div className="flex justify-between border-b border-[#102534]/10 pb-8">
        <h1 className="font-serif text-5xl">Onderzoeken</h1>
        <Link href="/admin/onderzoeken/nieuw" className="bg-[#102534] px-5 py-3 text-sm text-white">Nieuw onderzoek</Link>
      </div>
      <div className="mt-8">
        {items?.map((item) => (
          <Link key={item.id} href={`/admin/content/${item.id}`} className="block border-b border-[#102534]/10 py-5 text-inherit no-underline">
            <h2 className="font-serif text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm text-[#102534]/45">{item.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
