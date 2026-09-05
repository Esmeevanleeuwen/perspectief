import Link from "next/link";
import { notFound } from "next/navigation";
import { getDossiers } from "@/lib/dossier-network";
import { getTopics } from "@/lib/dossier-core";
import { Shell, Breadcrumbs, Cards, styles, pageMetadata } from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ theme: string }> };

async function loadTheme(slug: string) {
  return getTopics(await getDossiers()).find((topic) => topic.slug === slug);
}

export async function generateMetadata({ params }: Props) {
  const theme = await loadTheme((await params).theme);
  return theme ? pageMetadata(`Dossiers over ${theme.title.toLowerCase()}`, `Onderzoek, hoofdstukken en bronnen bij ${theme.dossiers.map((dossier) => dossier.title).join(", ")}.`, `/themas/${theme.slug}`, theme.dossiers.some((dossier) => dossier.indexable)) : { title: "Thema niet gevonden", robots: { index: false } };
}

export default async function ThemePage({ params }: Props) {
  const theme = await loadTheme((await params).theme);
  if (!theme) notFound();

  const related = getTopics(theme.dossiers).filter((item) => item.slug !== theme.slug);
  return (
    <main>
      <Shell>
        <Breadcrumbs items={[{ title: "Thema’s", href: "/themas" }, { title: theme.title, href: `/themas/${theme.slug}` }]} />
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Thematische ingang</p>
          <h1>{theme.title}</h1>
          <p>Deze dossiers benaderen {theme.title.toLowerCase()} vanuit verschillende vragen. Vergelijk de afbakening en bronnen voordat je de bevindingen met elkaar verbindt.</p>
        </header>
        <section className={styles.section}><Cards items={theme.dossiers} /></section>
        {related.length > 0 && (
          <section className={styles.section}>
            <h2>Waar dit thema andere onderwerpen raakt.</h2>
            <nav className={styles.topics} aria-label="Verwante thema’s">{related.map((item) => <Link href={`/themas/${item.slug}`} key={item.slug}>{item.title} · {item.dossiers.length} gedeelde dossiers</Link>)}</nav>
          </section>
        )}
      </Shell>
    </main>
  );
}
