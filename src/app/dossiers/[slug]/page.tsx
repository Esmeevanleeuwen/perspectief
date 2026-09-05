import Link from "next/link";
import { notFound } from "next/navigation";
import { getDossiers, getDossier, getSourcesForDossier } from "@/lib/dossier-network";
import { dossierPath, chapterPath, sourcePath, relatedDossiers } from "@/lib/dossier-core";
import { platformName } from "@/lib/dossier-platforms";
import { Shell, Breadcrumbs, Topics, PartnerLinks, styles, pageMetadata } from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const dossier = await getDossier(slug);
  return dossier ? pageMetadata(dossier.title, dossier.description, dossierPath(slug), dossier.indexable) : { title: "Dossier niet gevonden", robots: { index: false } };
}

export default async function DossierPage({ params }: Props) {
  const { slug } = await params;
  const dossier = await getDossier(slug);
  if (!dossier) notFound();

  const [sources, allDossiers] = await Promise.all([getSourcesForDossier(slug), getDossiers()]);
  const related = relatedDossiers(dossier, allDossiers);

  return (
    <main>
      <Shell>
        <Breadcrumbs items={[{ title: "Dossiers", href: "/dossiers" }, { title: dossier.title, href: dossierPath(slug) }]} />
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{dossier.status}</p>
          <h1>{dossier.title}</h1>
          <p>{dossier.description}</p>
          <Topics themes={dossier.themes} />
        </header>

        <div className={styles.notice}>{dossier.boundaries}</div>

        <section className={styles.section} id="overzicht">
          <p className={styles.eyebrow}>Begin hier</p>
          <h2>{platformName === "Meridian" ? dossier.question : "Van onderbouwing naar afweging."}</h2>
          <p>{dossier.method}</p>
          {dossier.evidence && (
            <div className={styles.stats}>
              <span><strong>{dossier.evidence.established}</strong> vastgesteld</span>
              <span><strong>{dossier.evidence.disputed}</strong> betwist</span>
              <span><strong>{dossier.evidence.unknown}</strong> onbekend</span>
            </div>
          )}
        </section>

        <section className={styles.section} id="hoofdstukken">
          <h2>Lees het dossier stap voor stap.</h2>
          {dossier.chapters.length ? (
            <div className={styles.grid}>
              {dossier.chapters.map((chapter, index) => (
                <Link className={styles.card} key={chapter.id} href={chapterPath(slug, chapter.id)}>
                  <small>Hoofdstuk {String(index + 1).padStart(2, "0")}</small>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.paragraphs[0]?.slice(0, 180)}{(chapter.paragraphs[0]?.length ?? 0) > 180 ? "…" : ""}</p>
                  <span>Lees {chapter.title} →</span>
                </Link>
              ))}
            </div>
          ) : <p>Er zijn nog geen afzonderlijke hoofdstukken gepubliceerd. De beschikbare oorspronkelijke documenten staan hieronder.</p>}
        </section>

        {dossier.articles.length > 0 && (
          <section className={styles.section}>
            <h2>Artikelen binnen dit onderzoek.</h2>
            <div className={styles.grid}>{dossier.articles.map((article) => <Link className={styles.card} key={article.href} href={article.href}><h3>{article.title}</h3><p>{article.description}</p><span>Lees dit artikel →</span></Link>)}</div>
          </section>
        )}

        <section className={styles.section} id="bronnen">
          <h2>Controleer de oorspronkelijke bronnen.</h2>
          {sources.length > 0 && <div className={styles.grid}>{sources.map((source) => <Link className={styles.card} key={source.id} href={sourcePath(source.slug)}><small>Volledig brondocument · {source.pages.length} bronpagina’s</small><h3>{source.title}</h3><p>{source.description}</p><span>Lees {source.title} met inhoudsopgave →</span></Link>)}</div>}
          {dossier.externalSources?.map((source) => <p key={source.href}><a href={source.href}>{source.title}</a> — {source.description}</p>)}
          {!sources.length && !dossier.externalSources?.length && <p>Er zijn nog geen controleerbare bronlinks aan dit dossier gekoppeld. Dat is geen bewijs dat een bewering is vastgesteld.</p>}
        </section>

        {platformName === "Ampara" && (
          <section className={styles.section} id="politieke-afweging">
            <p className={styles.eyebrow}>Politieke keuze · apart van de feiten</p>
            <h2>Wat wil Ampara veranderen?</h2>
            <p>Een dossier is niet automatisch een aangenomen voorstel. Bekijk de standpunten, voorstellen en uitvoering afzonderlijk.</p>
            <nav className={styles.topics}><Link href="/standpunten">Standpunten</Link><Link href="/voorstellen">Voorstellen</Link><Link href="/besluiten">Besluiten</Link><Link href="/uitvoering">Uitvoering</Link></nav>
          </section>
        )}

        {related.length > 0 && (
          <section className={styles.section}>
            <h2>Waarom deze dossiers samenhangen.</h2>
            <div className={styles.grid}>{related.map((item) => <Link className={styles.card} key={item.slug} href={dossierPath(item.slug)}><small>Gedeeld thema: {item.shared.join(", ")}</small><h3>{item.title}</h3><p>{item.description}</p><span>Vergelijk de dossiers →</span></Link>)}</div>
            <p>Deze verbindingen zijn thematisch, niet automatisch oorzakelijk.</p>
          </section>
        )}

        <PartnerLinks dossier={dossier} />
      </Shell>
    </main>
  );
}
