import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { memberLibrary } from "@/lib/members";
import LibraryCards from "@/components/account/LibraryCards";
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ password_updated?: string; error?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const [query, { data: profile }, library] = await Promise.all([
    searchParams,
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
    memberLibrary(),
  ]);
  return (
    <>
      <section className="member-welcome">
        <p className="member-eyebrow">Mijn Meridian</p>
        <h1>
          Welkom{profile?.display_name ? `, ${profile.display_name}` : ""}.
        </h1>
        <p>
          Een plek om verder te lezen, nieuwe perspectieven te vinden en terug
          te keren naar wat je wilt bewaren.
        </p>
        <Link href="/account/bibliotheek" className="member-button">
          Open mijn bibliotheek →
        </Link>
      </section>
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
      <div className="member-section-heading">
        <div>
          <p className="member-eyebrow">Voor jou beschikbaar</p>
          <h2>Verder lezen</h2>
        </div>
        <Link href="/account/bibliotheek">Bekijk alles →</Link>
      </div>
      {library.error ? (
        <p className="member-notice member-error" role="alert">
          Je bibliotheek kon niet worden geladen. Probeer de pagina opnieuw te
          openen.
        </p>
      ) : library.data?.length ? (
        <LibraryCards items={library.data.slice(0, 3)} />
      ) : (
        <div className="member-empty">
          <h2>Je bibliotheek staat klaar.</h2>
          <p>
            Zodra de redactie een ledenartikel of een persoonlijke tekst
            publiceert, vind je die hier.
          </p>
          <Link href="/artikelen">Ontdek de openbare artikelen →</Link>
        </div>
      )}
      <div className="member-shortcuts">
        <Link href="/account/opgeslagen">
          <h2>Bewaar voor later</h2>
          <p>Je opgeslagen ledenpublicaties op één plek.</p>
        </Link>
        <Link href="/account/profiel">
          <h2>Jij houdt de regie</h2>
          <p>Beheer je naam, profiel en privacyvoorkeuren.</p>
        </Link>
      </div>
    </>
  );
}
