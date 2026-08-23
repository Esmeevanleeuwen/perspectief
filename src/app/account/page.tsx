import Link from "next/link";
import { requireUser } from "@/lib/auth/roles";
import { signOut } from "@/app/(auth)/actions";

export default async function AccountPage() {
  const { supabase, user, role } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-[#102633]/10 pb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#ad6540]">Jouw Meridian · {role}</p>
          <h1 className="mt-4 font-serif text-5xl">{profile?.display_name || user.email}</h1>
        </div>
        <form action={signOut}><button className="text-sm opacity-55">Uitloggen</button></form>
      </div>
      <div className="mt-10 grid gap-px bg-[#102633]/10 md:grid-cols-3">
        <Link href="/" className="min-h-48 bg-[#faf9f6] p-7 no-underline"><h2 className="font-serif text-2xl">Terug naar Meridian</h2></Link>
        <Link href="/artikelen" className="min-h-48 bg-[#faf9f6] p-7 no-underline"><h2 className="font-serif text-2xl">Artikelen</h2></Link>
        {role && ["owner","editor"].includes(role) && <Link href="/admin" className="min-h-48 bg-[#faf9f6] p-7 no-underline"><p className="text-xs uppercase tracking-[0.14em] text-[#ad6540]">Beheer</p><h2 className="mt-3 font-serif text-2xl">Redactie openen →</h2></Link>}
      </div>
    </main>
  );
}
