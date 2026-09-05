import Link from "next/link";
import { getDossiers } from "@/lib/dossier-network";
import { getTopics } from "@/lib/dossier-core";
import {
  Shell,
  Breadcrumbs,
  Cards,
  styles,
  pageMetadata,
} from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const dossiers = await getDossiers();
  return pageMetadata(
    "Onderzoeksdossiers",
    "Doorlopende onderzoeken waarin vragen, bronnen, onzekerheden en artikelen met elkaar verbonden blijven.",
    "/dossiers",
    dossiers.some((dossier) => dossier.indexable),
  );
}

export default async function DossiersPage() {
  const dossiers = await getDossiers();
  const topics = getTopics(dossiers);

  return (
    <main>
      <Shell>
        <Breadcrumbs items={[{ title: "Onderzoeksdossiers", href: "/dossiers" }]} />

        <header className={styles.hero}>
          <p className={styles.eyebrow}>Meridian · doorlopend onderzoek</p>
          <h1>Onderzoek dat niet stopt bij de publicatiedatum.</h1>
          <p>
            Een dossier bewaart de vraag achter het nieuws. Nieuwe artikelen, bronnen,
            tegenargumenten en ontbrekende informatie blijven daardoor onderdeel van
            hetzelfde onderzoek.
          </p>
        </header>

        <nav className={styles.topics} aria-label="Onderzoeksdossiers per thema">
          {topics.map((topic) => (
            <Link key={topic.slug} href={`/themas/${topic.slug}`}>
              {topic.title} ({topic.dossiers.length})
            </Link>
          ))}
        </nav>

        <Cards items={dossiers} />

        <section className={styles.section}>
          <p className={styles.eyebrow}>De leesroute</p>
          <h2>Van vraag naar controleerbare samenhang.</h2>
          <div className={styles.grid}>
            {[
              ["01", "Vraag", "Ieder dossier begint met wat nog moet worden uitgezocht."],
              ["02", "Onderbouwing", "Bronnen en claims blijven terug te vinden bij de oorspronkelijke context."],
              ["03", "Tegenspraak", "Afwijkende verklaringen verdwijnen niet uit beeld wanneer een verhaal groeit."],
              ["04", "Open vragen", "Wat nog niet aantoonbaar is, wordt niet opgevuld met zekerheid."],
            ].map(([number, title, description]) => (
              <article className={styles.card} key={number}>
                <small>{number}</small>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <p><Link href="/bronnen">Open de bronbibliotheek →</Link></p>
        </section>
      </Shell>
    </main>
  );
}
