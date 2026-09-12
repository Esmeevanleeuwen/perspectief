import Link from "next/link";
import { requireMemberAdmin } from "@/lib/auth/user";
import { pageNumber, publicationFields, publicationHref } from "@/lib/members";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    pagina?: string;
    deleted?: string;
  }>;
}) {
  const { supabase } = await requireMemberAdmin();
  const query = await searchParams;
  const page = pageNumber(query.pagina);
  const q = (query.q ?? "").slice(0, 100);
  let request = supabase
    .from("member_publications")
    .select(publicationFields, { count: "exact" });
  if (q) request = request.ilike("title", `%${q.replace(/[%_]/g, "\\$&")}%`);
  if (["draft", "published"].includes(query.status ?? ""))
    request = request.eq("status", query.status!);
  const { data, error, count } = await request
    .order("updated_at", { ascending: false })
    .order("id")
    .range((page - 1) * 20, page * 20 - 1);
  const href = (n: number) =>
    `/admin/ledencontent?${new URLSearchParams({ q, status: query.status ?? "", pagina: String(n) })}`;
  return (
    <>
      <div className="member-section-heading">
        <div>
          <p className="member-eyebrow">Account & redactie</p>
          <h1>Ledenpublicaties</h1>
          <p>
            Artikelen voor alle leden en teksten voor specifieke gebruikers.
          </p>
        </div>
        <Link href="/admin/ledencontent/nieuw" className="member-button">
          + Nieuwe publicatie
        </Link>
      </div>
      {query.deleted && (
        <p role="status" className="member-notice">
          De publicatie is verwijderd.
        </p>
      )}
      <form className="member-search">
        <label className="member-grow">
          Zoek publicatie
          <input
            name="q"
            type="search"
            defaultValue={q}
            maxLength={100}
            placeholder="Zoek op titel"
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={query.status ?? ""}>
            <option value="">Alle statussen</option>
            <option value="draft">Concepten</option>
            <option value="published">Gepubliceerd</option>
          </select>
        </label>
        <button className="member-button">Zoeken</button>
      </form>
      {error ? (
        <p role="alert" className="member-notice member-error">
          Publicaties laden lukte niet. Controleer de databaseverbinding.
        </p>
      ) : data?.length ? (
        <>
          <div className="member-table-wrap">
            <table className="member-table">
              <thead>
                <tr>
                  <th>Titel</th>
                  <th>Status</th>
                  <th>Toegang</th>
                  <th>Bewerkt</th>
                  <th>
                    <span className="sr-only">Acties</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/admin/ledencontent/${item.id}`}>
                        <strong>{item.title}</strong>
                      </Link>
                      <small>
                        {item.kind === "text" ? "Tekst" : "Artikel"}
                      </small>
                    </td>
                    <td>
                      <span className="member-badge">
                        {item.status === "published"
                          ? "Gepubliceerd"
                          : "Concept"}
                      </span>
                    </td>
                    <td>
                      {item.audience === "members"
                        ? "Alle leden"
                        : "Geselecteerde gebruikers"}
                    </td>
                    <td>
                      {new Date(item.updated_at).toLocaleDateString("nl-NL")}
                    </td>
                    <td>
                      <Link href={`/admin/ledencontent/${item.id}`}>
                        Bewerken
                      </Link>
                      {item.status === "published" && (
                        <Link href={publicationHref(item.slug)}>Lezen ↗</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="member-pagination" aria-label="Publicatiepagina’s">
            {page > 1 && <Link href={href(page - 1)}>← Vorige</Link>}
            <span>
              {count} publicaties · Pagina {page}
            </span>
            {page * 20 < (count ?? 0) && (
              <Link href={href(page + 1)}>Volgende →</Link>
            )}
          </nav>
        </>
      ) : (
        <div className="member-empty">
          <h2>
            {q || query.status
              ? "Geen resultaten"
              : "De eerste tekst begint hier."}
          </h2>
          <p>Maak een artikel of tekst en kies voor wie deze bedoeld is.</p>
          <Link href="/admin/ledencontent/nieuw">Maak een publicatie →</Link>
        </div>
      )}
    </>
  );
}
