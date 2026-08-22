import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { count: savedCount }, { count: contributionCount }] =
    await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", user!.id).single(),
      supabase.from("saved_items").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("contributions").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
    ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
      <p className="text-xs uppercase tracking-[0.2em] text-[#9a6748]">Jouw Meridian</p>
      <h1 className="mt-5 font-serif text-6xl tracking-[-0.04em]">
        Welkom{profile?.display_name ? `, ${profile.display_name}` : ""}.
      </h1>
      <p className="mt-6 max-w-2xl text-[#102534]/55">
        Niet een feed die leert wat je graag gelooft, maar een plek waar je terugkomt naar wat nog open staat.
      </p>

      <div className="mt-12 grid gap-px bg-[#102534]/10 md:grid-cols-3">
        <Card href="/account/opgeslagen" title={`${savedCount ?? 0} opgeslagen`} text="Bewaar routes, bronnen en onderzoeken." />
        <Card href="/account/profiel" title="Profiel & privacy" text="Bepaal zelf wat Meridian mag onthouden." />
        <Card href="/admin" title={`${contributionCount ?? 0} bijdragen`} text="Voor beheerders en redactie: ga naar de beheeromgeving." />
      </div>
    </div>
  );
}

function Card({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href} className="min-h-52 bg-[#fcfaf7] p-7 text-inherit no-underline">
      <h2 className="font-serif text-3xl">{title}</h2>
      <p className="mt-4 text-sm text-[#102534]/50">{text}</p>
    </Link>
  );
}
