import Link from "next/link";
import { getSources, getDossiers, getDossier } from "@/lib/dossier-network";
import { sourcePath, dossierPath } from "@/lib/dossier-core";
import { Shell, Breadcrumbs, styles, pageMetadata } from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";

async function sourceReferences() {
  const dossiers = await Promise.all((await getDossiers()).map((dossier) => getDossier(dossier.slug)));
  return dossiers.flatMap((dossier) => dossier?.externalSources?.map((source) => ({ ...source, dossierSlug: dossier.slug, dossierTitle: dossier.title })) ?? []);
}

export async function generateMetadata() {
  const [documents, references] = await Promise.all([getSources(), sourceReferences()]);
  return pageMetadata("Bronbibliotheek", "Openbare bronnen, volledige brondocumenten en gekoppelde dossiers.", "/bronnen", documents.length + references.length > 0);
}

export default async function SourcesPage() {
  const [documents, references] = await Promise.all([getSources(), sourceReferences()]);
  return (
    <main>
      <Shell>
        <Breadcrumbs items={[{ title: "Bronbibliotheek", href: "/bronnen" }]} />
        <header className={styles.hero}>
          <h1>Terug naar de oorspronkelijke bron.</h1>
          <p>Een document wordt één keer aangeboden en blijft verbonden met de dossiers die het gebruiken. Publicatie betekent niet dat iedere bewering is geverifieerd.</p>
        </header>
        <section className={styles.section}>
          {documents.length ? <div className={styles.grid}>{documents.map((document) => <Link href={sourcePath(document.slug)} className={styles.card} key={document.id}><small>{document.pages.length} bronpagina’s · {document.dossiers.length} dossiers</small><h2>{document.title}</h2><p>{document.description}</p><span>Lees het oorspronkelijke document →</span></Link>)}</div> : !references.length ? <p>Er zijn nog geen bronnen aan deze bibliotheek gekoppeld. Bekijk de onderzoeksgrenzen bij de dossiers.</p> : null}
          {references.length > 0 && <section className={styles.section}><h2>Bronverwijzingen bij het onderzoek.</h2>{references.map((reference, index) => <article key={`${reference.href}-${index}`} className={styles.card}><h3><a href={reference.href}>{reference.title}</a></h3><p>{reference.description}</p><Link href={dossierPath(reference.dossierSlug)}>Gebruikt bij {reference.dossierTitle} →</Link></article>)}</section>}
          <p><Link href="/dossiers">Terug naar de dossiers →</Link></p>
        </section>
      </Shell>
    </main>
  );
}
