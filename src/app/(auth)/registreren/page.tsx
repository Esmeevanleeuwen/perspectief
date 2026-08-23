import Link from "next/link";
import { signUp } from "../actions";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return (
    <section className="mx-auto grid min-h-[75vh] max-w-6xl items-center gap-14 px-6 md:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#ad6540]">Samenwerken</p>
        <h1 className="mt-4 max-w-lg font-serif text-5xl leading-[1] tracking-[-0.04em] md:text-7xl">Een account zonder sociale ranglijst.</h1>
        <p className="mt-6 max-w-md leading-7 opacity-55">Geen volgerscore of politieke profielwaarde. Alleen identiteit, bijdrage en toegang.</p>
      </div>
      <div className="border border-[#102633]/10 bg-white p-7 md:p-10">
        <h2 className="font-serif text-3xl">Account maken</h2>
        {query.error && <p className="mt-5 border border-[#ad6540]/30 p-4 text-sm">{decodeURIComponent(query.error)}</p>}
        <form action={signUp} className="mt-8 space-y-4">
          <input className="meridian-field" name="display_name" placeholder="Naam of pseudoniem" />
          <input className="meridian-field" name="email" type="email" required placeholder="E-mail" />
          <input className="meridian-field" name="password" type="password" minLength={8} required placeholder="Wachtwoord" />
          <button className="w-full bg-[#102633] px-5 py-4 text-sm text-white">Registreren →</button>
        </form>
        <p className="mt-6 text-sm opacity-60">Al een account? <Link href="/login">Inloggen</Link></p>
      </div>
    </section>
  );
}
