import Link from "next/link";
import { getDossiers } from "@/lib/dossier-network";
import { getTopics } from "@/lib/dossier-core";
import { platformName } from "@/lib/dossier-platforms";
import { Shell, Breadcrumbs, Cards, styles, pageMetadata } from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const dossiers = await getDossiers();
  return pageMetadata("Dossiers", "Doorlopende dossiers met hoofdstukken, bronnen en verwante onderwerpen.", "/dossiers", dossiers.some((dossier) => dossier.indexable));
}

export default async function DossiersPage() {
  const dossiers = await getDossiers();
  const topics = getTopics(dossiers);

  return (
    <main>
      <Shell>
        <Breadcrumbs items={[{ title: "Dossiers", href: "/dossiers" }]} />
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{platformName} · dossierbibliotheek</p>
          <h1>Niet het losse verhaal. Het grotere verband.</h1>
          <p>{platformName === "Meridian" ? "Volg een onderzoek van de eerste vraag tot de bronnen, tegenargumenten en nieuwe inzichten." : "Lees de onderbouwing van maatschappelijke vraagstukken en zie waar onderzoek overgaat in een politieke afweging."}</p>
        </header>
        <nav className={styles.topics} aria-label="Dossiers per thema">
          {topics.map((topic) => <Link key={topic.slug} href={`/themas/${topic.slug}`}>{topic.title} ({topic.dossiers.length})</Link>)}
        </nav>
        <Cards items={dossiers} />
        <section className={styles.section}>
          <h2>Zelf de onderbouwing volgen.</h2>
          <p>Elk dossier heeft een eigen inhoudsopgave. Open vanuit een hoofdstuk het dossieroverzicht, de brondocumenten of een verwant onderwerp.</p>
          <Link href="/bronnen">Bekijk de bronbibliotheek →</Link>
        </section>
      </Shell>
    </main>
  );
}
