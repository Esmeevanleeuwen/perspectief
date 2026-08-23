import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#102633]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link href="/" className="font-serif text-2xl no-underline">MERIDIAN</Link>
        <Link href="/" className="text-sm no-underline opacity-55">Terug</Link>
      </header>
      {children}
    </main>
  );
}
