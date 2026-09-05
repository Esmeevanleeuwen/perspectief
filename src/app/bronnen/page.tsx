import Link from "next/link";
import { getDossier, getDossiers, getSources } from "@/lib/dossier-network";
import { dossierPath, sourcePath } from "@/lib/dossier-core";
import {
  Breadcrumbs,
  Shell,
  pageMetadata,
  styles,
} from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";

async function sourceReferences() {
  const dossiers = await Promise.all(
    (await getDossiers()).map((dossier) => getDossier(dossier.slug)),
  );
  return dossiers.flatMap((dossier) =>
    dossier?.externalSources?.map((source) => ({
      ...source,
      dossierSlug: dossier.slug,
      dossierTitle: dossier.title,
    })) ?? [],
  );
}

export async function generateMetadata() {
  const [documents, references] = await Promise.all([getSources(), sourceReferences()]);
  return pageMetadata(
    "Bronnenkamer",
    "Oorspronkelijke documenten en bronverwijzingen die aan Meridian-onderzoeken zijn gekoppeld.",
    "/bronnen",
    documents.length + references.length > 0,
  );
}

export default async function SourcesPage() {
  const [documents, references] = await Promise.all([getSources(), sourceReferences()]);

  return (
    <main>
      <Shell>
        <Breadcrumbs items={[{ title: "Bronnenkamer", href: "/bronnen" }]} />
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Meridian · herkomst en controle</p>
          <h1>Terug naar wat er werkelijk is vastgelegd.</h1>
          <p>
            Een document krijgt één vaste plek en kan vanuit meerdere onderzoeken
            worden gebruikt. De oorspronkelijke context blijft zichtbaar naast de
            redactionele uitleg van Meridian.
          </p>
        </header>

        <section className={styles.section}>
          <p className={styles.eyebrow}>Volledige documenten</p>
          <h2>Lees de bron voordat je de conclusie overneemt.</h2>
          {documents.length ? (
            <div className={styles.grid}>
              {documents.map((document) => {
                const pageCount = document.pageCount ?? document.pages.length;
                const sectionCount = document.sectionCount ?? document.sections.length;
                return (
                  <Link href={sourcePath(document.slug)} className={styles.card} key={document.id}>
                    <small>
                      {pageCount} bronpagina’s · {sectionCount} inhoudspunten · {document.dossiers.length} dossiers
                    </small>
                    <h2>{document.title}</h2>
                    <p>{document.description}</p>
                    <span>Open het oorspronkelijke document →</span>
                  </Link>
                );
              })}
            </div>
          ) : !references.length ? (
            <p>Er zijn nog geen openbare brondocumenten aan de gedeelde dossierkern gekoppeld.</p>
          ) : null}

          {references.length > 0 && (
            <section className={styles.section}>
              <p className={styles.eyebrow}>Externe bronverwijzingen</p>
              <h2>Verwijzingen bij het onderzoek.</h2>
              <div className={styles.grid}>
                {references.map((reference, index) => (
                  <article key={`${reference.href}-${index}`} className={styles.card}>
                    <small>Gebruikt bij {reference.dossierTitle}</small>
                    <h3><a href={reference.href}>{reference.title}</a></h3>
                    <p>{reference.description}</p>
                    <Link href={dossierPath(reference.dossierSlug)}>Terug naar het dossier →</Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          <p><Link href="/dossiers">Terug naar de onderzoeksdossiers →</Link></p>
        </section>
      </Shell>
    </main>
  );
}
