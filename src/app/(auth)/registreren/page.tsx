import Link from "next/link";
import { register } from "../actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const query = await searchParams;

  return (
    <section className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-16 px-6 pb-20 md:grid-cols-[0.95fr_1.05fr] md:px-10">
      <div className="max-w-xl">
        <p className="mb-5 text-xs uppercase tracking-[0.22em] text-[#9a6748]">
          Geen sociale ranglijst
        </p>
        <h1 className="font-serif text-5xl leading-[0.98] tracking-[-0.045em] md:text-7xl">
          Eén identiteit om samen te werken.
        </h1>
      </div>

      <div className="mx-auto w-full max-w-md border border-[#102534]/12 bg-[#fcfaf7] p-7 md:p-10">
        <h2 className="font-serif text-4xl">Account maken</h2>
        {query.error && <p className="mt-5 text-sm">Registreren lukte niet.</p>}

        <form action={register} className="mt-8 space-y-5">
          <input name="display_name" placeholder="Naam of pseudoniem" className="field" />
          <input name="email" type="email" required placeholder="E-mail" className="field" />
          <input name="password" type="password" minLength={8} required placeholder="Wachtwoord" className="field" />
          <button className="w-full bg-[#102534] px-5 py-4 text-sm text-white">
            Account maken →
          </button>
        </form>

        <p className="mt-7 text-sm">
          Al een account? <Link href="/login">Inloggen</Link>
        </p>
      </div>
    </section>
  );
}
