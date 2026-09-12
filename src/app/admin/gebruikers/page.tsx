import Link from "next/link";
import { requireMemberAdmin } from "@/lib/auth/user";
import { pageNumber, type Member } from "@/lib/members";
import "@/app/member.css";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string }>;
}) {
  const { supabase } = await requireMemberAdmin();
  const query = await searchParams;
  const page = pageNumber(query.pagina);
  const q = (query.q ?? "").slice(0, 100);
  const { data, error } = await supabase.rpc("member_directory", {
    p_query: q,
    p_offset: (page - 1) * 100,
  });
  const members = (data ?? []) as Member[];
  const href = (n: number) =>
    `/admin/gebruikers?${new URLSearchParams({ q, pagina: String(n) })}`;
  return (
    <div className="member-admin">
      <p className="member-eyebrow">Accountbeheer</p>
      <h1>Gebruikers</h1>
      <p className="member-intro">
        Zoek een account en zet direct een artikel of persoonlijke tekst klaar.
      </p>
      <form className="member-search">
        <label className="member-grow">
          Naam of e-mailadres
          <input
            name="q"
            type="search"
            defaultValue={q}
            maxLength={100}
            placeholder="Zoek een gebruiker"
          />
        </label>
        <button className="member-button">Zoeken</button>
      </form>
      {error ? (
        <p className="member-error" role="alert">
          Gebruikers laden lukte niet.
        </p>
      ) : members.length ? (
        <>
          <div className="member-table-wrap">
            <table className="member-table">
              <thead>
                <tr>
                  <th>Gebruiker</th>
                  <th>Account sinds</th>
                  <th>Actie</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.display_name || "Gebruiker"}</strong>
                      <small>{m.email}</small>
                    </td>
                    <td>
                      {new Date(m.created_at).toLocaleDateString("nl-NL")}
                    </td>
                    <td>
                      <Link
                        href={`/admin/ledencontent/nieuw?gebruiker=${m.id}`}
                      >
                        Tekst klaarzetten →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="member-pagination" aria-label="Gebruikerspagina’s">
            {page > 1 && <Link href={href(page - 1)}>← Vorige</Link>}
            <span>
              {members[0]?.total_count} gebruikers · Pagina {page}
            </span>
            {page * 100 < (members[0]?.total_count ?? 0) && (
              <Link href={href(page + 1)}>Volgende →</Link>
            )}
          </nav>
        </>
      ) : (
        <div className="member-empty">
          <h2>Geen gebruikers gevonden.</h2>
          <p>Probeer een andere naam of een ander e-mailadres.</p>
        </div>
      )}
    </div>
  );
}
