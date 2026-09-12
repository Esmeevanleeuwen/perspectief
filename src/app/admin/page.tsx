import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";
import { publicContentHref } from "@/lib/admin/content";

export default async function AdminPage() {
  const { supabase, role } = await requireEditorialUser();

  const [all, published, research, draft, recent] = await Promise.all([
    supabase.from("content_items").select("*", { count: "exact", head: true }),
    supabase
      .from("content_items")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("content_items")
      .select("*", { count: "exact", head: true })
      .eq("content_type", "research"),
    supabase
      .from("content_items")
      .select("*", { count: "exact", head: true })
      .in("status", [
        "draft",
        "researching",
        "source_check",
        "editorial_review",
        "ready",
      ]),
    supabase
      .from("content_items")
      .select("id,slug,title,content_type,status,updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const stats = [
    ["Alle publicaties", all.error ? "—" : (all.count ?? 0), "/admin/content"],
    [
      "Gepubliceerd",
      published.error ? "—" : (published.count ?? 0),
      "/admin/content?status=published",
    ],
    [
      "Onderzoeken",
      research.error ? "—" : (research.count ?? 0),
      "/admin/onderzoeken",
    ],
    ["In bewerking", draft.error ? "—" : (draft.count ?? 0), "/admin/content"],
  ] as const;
  return (
    <div>
      <div className="workspace-page-heading">
        <div>
          <h1>Redactieoverzicht</h1>
          <p>Publicaties, onderzoeken en content voor je leden.</p>
        </div>
        <Link href="/admin/content/nieuw" className="member-button">
          + Nieuwe publicatie
        </Link>
      </div>
      <div className="workspace-stats" aria-label="Contentstatistieken">
        {stats.map(([label, value, href]) => (
          <Link href={href} key={label}>
            <span>
              <strong>{value}</strong>
              <small>{label}</small>
            </span>
          </Link>
        ))}
      </div>
      {[all, published, research, draft].some((result) => result.error) && (
        <p className="member-notice member-error" role="alert">
          Niet alle statistieken konden worden geladen. Vernieuw de pagina om
          het opnieuw te proberen.
        </p>
      )}
      <div className="workspace-columns">
        <section className="workspace-panel">
          <header className="workspace-panel-header">
            <h2>Laatst gewijzigd</h2>
            <Link href="/admin/content">Alles beheren →</Link>
          </header>
          {recent.error ? (
            <p className="member-notice member-error" role="alert">
              Publicaties laden lukte niet. Probeer de pagina opnieuw te openen.
            </p>
          ) : recent.data?.length ? (
            recent.data.map((item) => (
              <div key={item.id} className="workspace-admin-recent">
                <div>
                  <Link href={`/admin/content/${item.id}`}>
                    <strong>{item.title}</strong>
                  </Link>
                  <small>
                    {item.content_type} ·{" "}
                    {new Date(item.updated_at).toLocaleDateString("nl-NL")}
                  </small>
                </div>
                <span className="member-badge">
                  {item.status === "published"
                    ? "Gepubliceerd"
                    : item.status === "draft"
                      ? "Concept"
                      : item.status.replaceAll("_", " ")}
                </span>
                {item.status === "published" && (
                  <Link
                    href={publicContentHref(item.content_type, item.slug)}
                    target="_blank"
                  >
                    Bekijk op de site ↗
                  </Link>
                )}
              </div>
            ))
          ) : (
            <div className="member-empty">
              <h2>Nog geen publicaties</h2>
              <Link href="/admin/content/nieuw">
                Maak de eerste publicatie →
              </Link>
            </div>
          )}
        </section>
        <aside className="workspace-context">
          <p className="member-eyebrow">Aan de slag</p>
          <h2>Maak iets nieuws</h2>
          <Link href="/admin/content/nieuw" className="workspace-context-link">
            <span>
              <strong>Openbare publicatie</strong>
              <small>Artikel, analyse of casus</small>
            </span>
            <span aria-hidden="true">+</span>
          </Link>
          <Link
            href="/admin/onderzoeken/nieuw"
            className="workspace-context-link"
          >
            <span>
              <strong>Onderzoek</strong>
              <small>Een vraag verder uitdiepen</small>
            </span>
            <span aria-hidden="true">+</span>
          </Link>
          {["owner", "admin"].includes(role) && (
            <>
              <Link
                href="/admin/ledencontent/nieuw"
                className="workspace-context-link"
              >
                <span>
                  <strong>Ledenpublicatie</strong>
                  <small>Voor alle leden of gekozen lezers</small>
                </span>
                <span aria-hidden="true">+</span>
              </Link>
              <Link href="/admin/gebruikers" className="workspace-context-link">
                <span>
                  <strong>Gebruiker zoeken</strong>
                  <small>Zet een persoonlijke tekst klaar</small>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
