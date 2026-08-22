import { createClient } from "@/lib/supabase/server";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: items } = await supabase.from("saved_items").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-10">
      <h1 className="font-serif text-5xl">Opgeslagen routes</h1>
      <div className="mt-10 border-t border-[#102534]/10">
        {items?.map((item) => (
          <div key={item.id} className="border-b border-[#102534]/10 py-5">
            <span className="text-xs uppercase tracking-[0.12em] text-[#9a6748]">{item.item_type}</span>
            <h2 className="mt-2 font-serif text-2xl">{item.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
