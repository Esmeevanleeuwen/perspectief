import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { role } = await requireEditorialUser();

  return (
    <main className="min-h-screen bg-[#f5f1ea] text-[#102534]">
      <header className="border-b border-[#102534]/10 bg-[#fbf8f3]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-5 px-6 py-5 md:px-10">
          <Link href="/" className="font-serif text-2xl no-underline">Meridian · redactie</Link>
          <nav className="flex gap-5 text-sm">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/content">Content</Link>
            <Link href="/admin/onderzoeken">Onderzoeken</Link>
          </nav>
          <span className="text-xs uppercase tracking-[0.14em] text-[#102534]/35">{role}</span>
        </div>
      </header>
      {children}
    </main>
  );
}
