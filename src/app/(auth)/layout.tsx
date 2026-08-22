import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-[#f7f3ed] text-[#102534]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 md:px-10">
        <Link href="/" className="font-serif text-2xl no-underline">
          Meridian
        </Link>
        <Link href="/" className="text-sm text-[#102534]/55 no-underline">
          Terug
        </Link>
      </header>
      {children}
    </main>
  );
}
