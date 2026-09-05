import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDossiers,
  getDossier,
  getSourcesForDossier,
} from "@/lib/dossier-network";
import {
  chapterPath,
  dossierPath,
  relatedDossiers,
  sourcePath,
} from "@/lib/dossier-core";
import {
  Breadcrumbs,
  PartnerLinks,
  Shell,
  Topics,
  pageMetadata,
  styles,
} from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const dossier = await getDossier(slug);
  return dossier
    ? pageMetadata(dossier.title, dossier.description, dossierPath(slug), dossier.indexable)
    : { title: "Dossier niet gevonden", robots: { index: false } };
}

export default async function DossierPage({ params }: Props) {
  const { slug } = await params;
  const dossier = await getDossier(slug);
  if (!dossier) notFound();

  const [sources, allDossiers] = await Promise.all([
    getSourcesForDossier(slug),
    getDossiers(),
  ]);
  const related = relatedDossiers(dossier, allDossiers);

  return (
    <main>
      <Shell>
        <Breadcrumbs
          items={[
            { title: "Onderzoeksdossiers", href: "/dossiers" },
            { title: dossier.title, href: dossierPath(slug) },
          ]}
        />

        <header className={styles.hero}>
          <p className={styles.eyebrow}>{dossier.status}</p>
          <h1>{dossier.title}</h1>
          <p>{dossier.description}</p>
          <Topics themes={dossier.themes} />
        </header>

        <div className={styles.notice}>{dossier.boundaries}</div>

        <section className={styles.section} id="overzicht">
          <p className={styles.eyebrow}>De centrale onderzoeksvraag</p>
          <h2>{dossier.question}</h2>
          {dossier.introduction && <p>{dossier.introduction}</p>}
          <p><strong>Werkwijze.</strong> {dossier.method}</p>
        </section>

        {dossier.claims?.length ? (
          <section className={styles.section} id="feitelijke-basis">
            <p className={styles.eyebrow}>Gedeelde dossierkern</p>
            <h2>Geregistreerde claims die gecontroleerd moeten blijven.</h2>
            <p>
              Deze formuleringen zijn onderdeel van de gedeelde databron. Hun aanwezigheid
              betekent niet automatisch dat iedere claim volledig is vastgesteld.
            </p>
            <div className={styles.grid}>
              {dossier.claims.map((claim, index) => (
                <article className={styles.card} key={claim.id}>
                  <small>Claim {String(index + 1).padStart(2, "0")}</small>
                  <h3>{claim.statement}</h3>
                  {(claim.validFrom || claim.validTo) && (
                    <p>Geldigheid: {claim.validFrom ?? "onbekend"} — {claim.validTo ?? "heden"}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className={styles.section} id="hoofdstukken">
          <p className={styles.eyebrow}>Onderzoeksopbouw</p>
          <h2>Lees de vraag stap voor stap uit.</h2>
          {dossier.chapters.length ? (
            <div className={styles.grid}>
              {dossier.chapters.map((chapter, index) => (
                <Link className={styles.card} key={chapter.id} href={chapterPath(slug, chapter.id)}>
                  <small>{chapter.eyebrow || `Onderzoeksdeel ${String(index + 1).padStart(2, "0")}`}</small>
                  <h3>{chapter.title}</h3>
                  <p>
                    {chapter.paragraphs[0]?.slice(0, 190)}
                    {(chapter.paragraphs[0]?.length ?? 0) > 190 ? "…" : ""}
                  </p>
                  <span>Open dit onderzoeksdeel →</span>
                </Link>
              ))}
            </div>
          ) : (
            <p>
              Voor Meridian is nog geen eigen hoofdstukstructuur gepubliceerd. De gedeelde
              kern blijft zichtbaar, maar wordt niet automatisch als redactionele conclusie overgenomen.
            </p>
          )}
        </section>

        {dossier.articles.length > 0 && (
          <section className={styles.section} id="artikelen">
            <p className={styles.eyebrow}>Publicaties binnen het dossier</p>
            <h2>Losse verhalen, verbonden aan dezelfde vraag.</h2>
            <div className={styles.grid}>
              {dossier.articles.map((article) => (
                <Link className={styles.card} key={article.href} href={article.href}>
                  <small>Artikel of casus</small>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <span>Lees de publicatie →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section} id="bronnen">
          <p className={styles.eyebrow}>Herkomst en controle</p>
          <h2>Ga terug naar de oorspronkelijke documenten.</h2>
          {sources.length > 0 ? (
            <div className={styles.grid}>
              {sources.map((source) => {
                const pageCount = source.pageCount ?? source.pages.length;
                const sectionCount = source.sectionCount ?? source.sections.length;
                return (
                  <Link className={styles.card} key={source.id} href={sourcePath(source.slug)}>
                    <small>{pageCount} bronpagina’s · {sectionCount} inhoudspunten</small>
                    <h3>{source.title}</h3>
                    <p>{source.description}</p>
                    <span>Open het brondocument →</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p>
              Er zijn nog geen openbare brondocumenten aan deze Meridian-weergave gekoppeld.
              Dat ontbreken is geen bewijs voor of tegen de onderzoeksvraag.
            </p>
          )}
        </section>

        {related.length > 0 && (
          <section className={styles.section}>
            <p className={styles.eyebrow}>Verwante onderzoeksvragen</p>
            <h2>Dezelfde thema’s, niet automatisch dezelfde oorzaak.</h2>
            <div className={styles.grid}>
              {related.map((item) => (
                <Link className={styles.card} key={item.slug} href={dossierPath(item.slug)}>
                  <small>Gedeeld thema: {item.shared.join(", ")}</small>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span>Vergelijk de dossiers →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <PartnerLinks dossier={dossier} />
      </Shell>
    </main>
  );
}
