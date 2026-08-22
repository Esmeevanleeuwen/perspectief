import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";

export default async function ContentPage() {
  const { supabase } = await requireEditorialUser();
  const { data: items } = await supabase.from("content_items").select("*").order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10">
      <div className="flex items-end justify-between border-b border-[#102534]/10 pb-8">
        <h1 className="font-serif text-5xl">Content</h1>
        <Link href="/admin/content/nieuw" className="bg-[#102534] px-5 py-3 text-sm text-white">Nieuwe publicatie</Link>
      </div>
      <div className="mt-8">
        {items?.map((item) => (
          <Link key={item.id} href={`/admin/content/${item.id}`} className="grid border-b border-[#102534]/10 py-5 text-inherit no-underline md:grid-cols-[150px_1fr_160px]">
            <span>{item.content_type}</span>
            <strong className="font-serif text-xl font-normal">{item.title}</strong>
            <span>{item.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
