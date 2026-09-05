import Link from "next/link";
import { getDossiers } from "@/lib/dossier-network";
import { getTopics } from "@/lib/dossier-core";
import { Shell, Breadcrumbs, styles, pageMetadata } from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const dossiers = await getDossiers();
  return pageMetadata("Thema’s", "Vind de dossiers achter een maatschappelijk thema.", "/themas", dossiers.some((dossier) => dossier.indexable));
}

export default async function ThemesPage() {
  const topics = getTopics(await getDossiers());
  return (
    <main>
      <Shell>
        <Breadcrumbs items={[{ title: "Thema’s", href: "/themas" }]} />
        <header className={styles.hero}>
          <h1>Eén onderwerp, meerdere vragen.</h1>
          <p>Thema’s verbinden dossiers zonder hun verschillen of onderzoeksgrenzen weg te nemen.</p>
        </header>
        <section className={styles.section}>
          <div className={styles.grid}>{topics.map((topic) => <Link key={topic.slug} className={styles.card} href={`/themas/${topic.slug}`}><h2>{topic.title}</h2><p>{topic.dossiers.map((dossier) => dossier.title).join(" · ")}</p><span>{topic.dossiers.length} dossiers over {topic.title.toLowerCase()} →</span></Link>)}</div>
        </section>
      </Shell>
    </main>
  );
}
