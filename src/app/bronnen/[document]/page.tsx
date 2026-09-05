import Link from "next/link";
import { notFound } from "next/navigation";
import { getSource } from "@/lib/dossier-network";
import { sourcePath, pageAnchor } from "@/lib/dossier-core";
import { Shell, Breadcrumbs, Cards, styles, pageMetadata } from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ document: string }> };

export async function generateMetadata({ params }: Props) {
  const document = await getSource((await params).document);
  return document ? pageMetadata(document.title, document.description || `Lees ${document.title} volledig met oorspronkelijke paginanummers en gekoppelde dossiers.`, sourcePath(document.slug), document.pages.some((page) => page.text.trim().length > 0)) : { title: "Bron niet gevonden", robots: { index: false } };
}

export default async function SourcePage({ params }: Props) {
  const document = await getSource((await params).document);
  if (!document) notFound();

  const pageNumbers = new Set(document.pages.map((page) => page.pageNumber));
  const contents = document.sections.filter((section) => pageNumbers.has(section.pageNumber));
  return (
    <main>
      <Shell>
        <Breadcrumbs items={[{ title: "Bronbibliotheek", href: "/bronnen" }, { title: document.title, href: sourcePath(document.slug) }]} />
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Oorspronkelijk document · {document.pages.length} bronpagina’s</p>
          <h1>{document.title}</h1>
          {document.description && <p>{document.description}</p>}
        </header>
        <p className={styles.notice}>De tekst is overgenomen uit het brondocument. Een gepubliceerde bron kan interpretaties of nog niet gecontroleerde beweringen bevatten. De tekstextractie kan opmaak verliezen.</p>
        <div className={styles.layout}>
          <details className={styles.toc} open>
            <summary>Inhoud van dit document</summary>
            <nav aria-label="Inhoudsopgave brondocument">
              {contents.length ? contents.map((section) => <a key={section.id} href={`#${pageAnchor(document.slug, section.pageNumber)}`}>{section.title} · p. {section.pageNumber}</a>) : document.pages.map((page) => <a key={page.id} href={`#${pageAnchor(document.slug, page.pageNumber)}`}>Bronpagina {page.pageNumber}</a>)}
            </nav>
          </details>
          <article className={styles.reading}>
            {document.pages.map((page) => <section key={page.id} className={styles.sourcePage} id={pageAnchor(document.slug, page.pageNumber)}><header><strong>Bronpagina {page.pageNumber}</strong><a href={`#${pageAnchor(document.slug, page.pageNumber)}`}>Link naar deze bronpagina</a></header><div>{page.text || "Voor deze pagina is geen tekstextractie beschikbaar."}</div><small>Controlemarkering in de bronregistratie: {page.reviewStatus || "niet opgegeven"}. Dit is geen oordeel over alle beweringen op deze pagina.</small></section>)}
          </article>
        </div>
        <section className={styles.section}>
          <h2>Dossiers die dit document gebruiken.</h2>
          <Cards items={document.dossiers} />
          <p><Link href="/bronnen">Terug naar alle bronnen →</Link></p>
        </section>
      </Shell>
    </main>
  );
}
