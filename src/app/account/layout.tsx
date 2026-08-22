import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";

export default async function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[#f7f3ed] text-[#102534]">
      <header className="border-b border-[#102534]/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-6 md:px-10">
          <Link href="/" className="font-serif text-2xl no-underline">Meridian</Link>
          <nav className="flex gap-5 text-sm">
            <Link href="/account">Overzicht</Link>
            <Link href="/account/opgeslagen">Opgeslagen</Link>
            <Link href="/account/profiel">Profiel & privacy</Link>
            <form action={signOut}><button>Uitloggen</button></form>
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
