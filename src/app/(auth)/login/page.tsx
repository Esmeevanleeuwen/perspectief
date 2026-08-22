import Link from "next/link";
import { login } from "../actions";

type Props = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const query = await searchParams;

  return (
    <section className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-16 px-6 pb-20 md:grid-cols-[0.95fr_1.05fr] md:px-10">
      <div className="max-w-xl">
        <p className="mb-5 text-xs uppercase tracking-[0.22em] text-[#9a6748]">
          Samenwerken
        </p>
        <h1 className="font-serif text-5xl leading-[0.98] tracking-[-0.045em] md:text-7xl">
          Je account is een werkruimte, geen politieke identiteit.
        </h1>
        <p className="mt-8 max-w-lg text-base leading-8 text-[#102534]/62">
          Bewaar onderzoeken, voeg bronnen toe, deel perspectieven en werk samen aan ontbrekende informatie.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md border border-[#102534]/12 bg-[#fcfaf7] p-7 md:p-10">
        <h2 className="font-serif text-4xl">Inloggen</h2>

        {query.error && (
          <p className="mt-5 border border-[#9a6748]/25 p-4 text-sm">
            Inloggen lukte niet.
          </p>
        )}

        {query.message === "check_email" && (
          <p className="mt-5 border border-[#102534]/10 p-4 text-sm">
            Controleer je e-mail om je account te bevestigen.
          </p>
        )}

        <form action={login} className="mt-8 space-y-5">
          <input name="email" type="email" required placeholder="E-mail" className="field" />
          <input name="password" type="password" required placeholder="Wachtwoord" className="field" />
          <button className="w-full bg-[#102534] px-5 py-4 text-sm text-[#fcfaf7]">
            Naar Meridian →
          </button>
        </form>

        <p className="mt-7 text-sm text-[#102534]/55">
          Nog geen account? <Link href="/registreren">Registreren</Link>
        </p>
      </div>
    </section>
  );
}
