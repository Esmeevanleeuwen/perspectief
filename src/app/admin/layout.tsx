import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";

const nav = [
  { href: "/admin", label: "Overzicht", index: "01" },
  { href: "/admin/content", label: "Publicaties", index: "02" },
  { href: "/admin/onderzoeken", label: "Onderzoeken", index: "03" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { role } = await requireEditorialUser();
  const items = [
    ...nav,
    ...(["owner", "admin"].includes(role)
      ? [
          {
            href: "/admin/ledencontent",
            label: "Ledenpublicaties",
            index: "04",
          },
          { href: "/admin/gebruikers", label: "Gebruikers", index: "05" },
        ]
      : []),
  ];

  return (
    <main className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 bg-[#f6f7f7] text-[#102534]">
      <div className="mx-auto grid min-h-screen max-w-[1720px] lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-[#102534]/10 bg-[#102534] px-6 py-7 text-white lg:flex lg:flex-col">
          <Link
            href="/admin"
            className="flex items-center gap-3 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span className="flex h-9 w-9 items-center justify-center border border-white/25 font-serif text-xl">
              M
            </span>
            <span>
              <strong className="block text-sm tracking-[0.16em]">
                MERIDIAN
              </strong>
              <small className="text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
                Redactie
              </small>
            </span>
          </Link>

          <nav className="mt-14 space-y-1" aria-label="Redactienavigatie">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="grid grid-cols-[2rem_1fr] items-center rounded-sm px-3 py-3 text-sm text-white/78 no-underline transition hover:bg-white/8 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span className="font-mono text-[0.62rem] text-white/35">
                  {item.index}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/12 pt-5">
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/35">
              Ingelogd als
            </p>
            <p className="mt-1 text-sm capitalize text-white/80">
              {role.replaceAll("_", " ")}
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex text-xs text-white/55 underline-offset-4 hover:text-white hover:underline"
            >
              Bekijk publieke site ↗
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[#102534]/10 bg-white/95 px-5 backdrop-blur md:px-8 lg:px-10">
            <div className="lg:hidden">
              <Link href="/admin" className="font-serif text-xl no-underline">
                Meridian Admin
              </Link>
            </div>
            <nav
              className="hidden gap-5 text-xs lg:flex"
              aria-label="Snelle acties"
            >
              <Link
                href="/admin/content/nieuw"
                className="underline-offset-4 hover:underline"
              >
                + Nieuwe publicatie
              </Link>
              <Link
                href="/admin/onderzoeken/nieuw"
                className="underline-offset-4 hover:underline"
              >
                + Nieuw onderzoek
              </Link>
            </nav>
            <span className="rounded-full bg-[#102534]/6 px-3 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-[#102534]/55">
              {role.replaceAll("_", " ")}
            </span>
          </header>

          <nav
            className="flex gap-1 overflow-x-auto border-b border-[#102534]/10 bg-white px-4 py-2 lg:hidden"
            aria-label="Mobiele redactienavigatie"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-4 py-2 text-xs no-underline hover:bg-[#102534]/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {children}
        </section>
      </div>
    </main>
  );
}
