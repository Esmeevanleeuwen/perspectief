import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { memberLibrary } from "@/lib/members";
import LibraryCards from "@/components/account/LibraryCards";
import WorkspaceIcon from "@/components/account/WorkspaceIcon";
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ password_updated?: string; error?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const [query, { data: profile }, library, personal, saved] =
    await Promise.all([
      searchParams,
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle(),
      memberLibrary(),
      supabase
        .from("member_publications")
        .select("id", { count: "exact", head: true })
        .eq("status", "published")
        .eq("audience", "selected"),
      supabase
        .from("member_bookmarks")
        .select("publication_id,member_publications!inner(id)", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id),
    ]);
  return (
    <>
      <div className="workspace-page-heading">
        <div>
          <h1>Jouw overzicht</h1>
          <p>
            {profile?.display_name
              ? `Welkom terug, ${profile.display_name}.`
              : "Welkom bij Mijn Meridian."}{" "}
            Dit staat er voor je klaar.
          </p>
        </div>
        <Link href="/account/bibliotheek" className="member-button">
          Open bibliotheek <WorkspaceIcon name="arrow" />
        </Link>
      </div>
      {query.password_updated && (
        <p className="member-notice" role="status">
          Je nieuwe wachtwoord is opgeslagen.
        </p>
      )}
      {query.error === "signout" && (
        <p className="member-notice member-error" role="alert">
          Uitloggen lukte niet. Probeer het opnieuw.
        </p>
      )}
      <div className="workspace-stats" aria-label="Jouw bibliotheek in cijfers">
        <Link href="/account/bibliotheek">
          <span className="workspace-feature-icon violet">
            <WorkspaceIcon name="library" />
          </span>
          <span>
            <strong>{library.error ? "—" : (library.count ?? 0)}</strong>
            <small>In je bibliotheek</small>
          </span>
        </Link>
        <Link href="/account/bibliotheek?voor=jou">
          <span className="workspace-feature-icon orange">
            <WorkspaceIcon name="write" />
          </span>
          <span>
            <strong>{personal.error ? "—" : (personal.count ?? 0)}</strong>
            <small>Persoonlijk gedeeld</small>
          </span>
        </Link>
        <Link href="/account/opgeslagen">
          <span className="workspace-feature-icon teal">
            <WorkspaceIcon name="bookmark" />
          </span>
          <span>
            <strong>{saved.error ? "—" : (saved.count ?? 0)}</strong>
            <small>Opgeslagen</small>
          </span>
        </Link>
      </div>
      {(personal.error || saved.error) && (
        <p className="member-notice member-error" role="alert">
          Niet alle aantallen konden worden geladen. Open je bibliotheek of
          opgeslagen artikelen om het opnieuw te proberen.
        </p>
      )}
      <div className="workspace-columns">
        <section className="workspace-panel">
          <header className="workspace-panel-header">
            <h2>Laatst toegevoegd</h2>
            <Link href="/account/bibliotheek">Bekijk alles →</Link>
          </header>
          {library.error ? (
            <p className="member-notice member-error" role="alert">
              Je bibliotheek kon niet worden geladen. Probeer de pagina opnieuw
              te openen.
            </p>
          ) : library.data?.length ? (
            <LibraryCards items={library.data.slice(0, 6)} />
          ) : (
            <div className="member-empty">
              <span className="workspace-feature-icon violet">
                <WorkspaceIcon name="library" />
              </span>
              <h2 className="mt-4">Je bibliotheek staat klaar</h2>
              <p>
                Nieuwe ledenartikelen en teksten van de redactie verschijnen
                hier zodra ze met je zijn gedeeld.
              </p>
              <Link href="/artikelen">Ontdek de openbare artikelen →</Link>
            </div>
          )}
        </section>
        <aside className="workspace-context" aria-label="Snel naar">
          <p className="member-eyebrow">Jouw account</p>
          <h2>Snel verder</h2>
          <Link
            href="/account/bibliotheek?voor=jou"
            className="workspace-context-link"
          >
            <span>
              <strong>Persoonlijk voor jou</strong>
              <small>Teksten die met jou zijn gedeeld</small>
            </span>
            <WorkspaceIcon name="arrow" />
          </Link>
          <Link href="/account/opgeslagen" className="workspace-context-link">
            <span>
              <strong>Je leeslijst</strong>
              <small>Verder met wat je hebt bewaard</small>
            </span>
            <WorkspaceIcon name="arrow" />
          </Link>
          <Link href="/account/profiel" className="workspace-context-link">
            <span>
              <strong>Profiel & privacy</strong>
              <small>Beheer je gegevens en voorkeuren</small>
            </span>
            <WorkspaceIcon name="arrow" />
          </Link>
        </aside>
      </div>
    </>
  );
}
