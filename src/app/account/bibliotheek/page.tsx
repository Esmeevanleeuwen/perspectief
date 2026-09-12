import Link from "next/link";
import { memberLibrary, pageNumber } from "@/lib/members";
import LibraryCards from "@/components/account/LibraryCards";
export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string; voor?: string }>;
}) {
  const query = await searchParams;
  const q = (query.q ?? "").slice(0, 100);
  const page = pageNumber(query.pagina);
  const personal = query.voor === "jou";
  const result = await memberLibrary(q, page, personal);
  const href = (n: number) =>
    `/account/bibliotheek?${new URLSearchParams({ q, pagina: String(n), voor: personal ? "jou" : "alle" })}`;
  return (
    <>
      <h1>Mijn bibliotheek</h1>
      <p className="member-intro">
        Artikelen voor leden en teksten die persoonlijk met je zijn gedeeld.
      </p>
      <form className="member-search" role="search">
        <label className="member-grow">
          Zoek op titel
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Waar wil je over lezen?"
            maxLength={100}
          />
        </label>
        <label>
          Toon
          <select name="voor" defaultValue={personal ? "jou" : "alle"}>
            <option value="alle">Alle publicaties</option>
            <option value="jou">Persoonlijk gedeeld</option>
          </select>
        </label>
        <button className="member-button">Zoeken</button>
      </form>
      {result.error ? (
        <p role="alert" className="member-notice member-error">
          Laden lukte niet. Probeer het opnieuw.
        </p>
      ) : result.data?.length ? (
        <>
          <p className="member-muted member-result-count">
            {result.count} publicaties
          </p>
          <LibraryCards items={result.data} />
          <nav className="member-pagination" aria-label="Bibliotheekpagina’s">
            {page > 1 && <Link href={href(page - 1)}>← Vorige</Link>}
            <span>Pagina {page}</span>
            {page * 12 < (result.count ?? 0) && (
              <Link href={href(page + 1)}>Volgende →</Link>
            )}
          </nav>
        </>
      ) : (
        <div className="member-empty">
          <h2>
            {q || personal
              ? "Geen publicaties gevonden."
              : "Hier begint je bibliotheek."}
          </h2>
          <p>
            {q || personal
              ? "Probeer een andere zoekterm of bekijk alle publicaties."
              : "Nieuwe ledenartikelen en persoonlijke teksten verschijnen hier zodra ze beschikbaar zijn."}
          </p>
          <Link href={q || personal ? "/account/bibliotheek" : "/artikelen"}>
            {q || personal ? "Wis filters" : "Lees openbare artikelen"} →
          </Link>
        </div>
      )}
    </>
  );
}
