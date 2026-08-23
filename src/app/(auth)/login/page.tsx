import Link from "next/link";
import { signIn } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const query = await searchParams;

  return (
    <section className="mx-auto grid min-h-[75vh] max-w-6xl items-center gap-14 px-6 md:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#ad6540]">
          Account
        </p>

        <h1 className="mt-4 max-w-lg font-serif text-5xl leading-[1] tracking-[-0.04em] md:text-7xl">
          Terug naar wat nog open staat.
        </h1>

        <p className="mt-6 max-w-md leading-7 opacity-55">
          Bewaar onderzoek, lever bronnen aan en werk als redacteur aan dezelfde kennislaag.
        </p>
      </div>

      <div className="border border-[#102633]/10 bg-white p-7 md:p-10">
        <h2 className="font-serif text-3xl">
          Inloggen
        </h2>

        {query.error && (
          <p className="mt-5 border border-[#ad6540]/30 p-4 text-sm">
            {decodeURIComponent(query.error)}
          </p>
        )}

        {query.message && (
          <p className="mt-5 border border-[#102633]/10 p-4 text-sm">
            {query.message}
          </p>
        )}

        <form action={signIn} className="mt-8 space-y-4">
          <input
            className="meridian-field"
            name="email"
            type="email"
            required
            placeholder="E-mail"
          />

          <input
            className="meridian-field"
            name="password"
            type="password"
            required
            placeholder="Wachtwoord"
          />

          <button className="w-full bg-[#102633] px-5 py-4 text-sm text-white">
            Inloggen →
          </button>
        </form>

        <p className="mt-6 text-sm opacity-60">
          Nog geen account?{" "}
          <Link href="/registreren">
            Registreren
          </Link>
        </p>
      </div>
    </section>
  );
}