import Link from "next/link";
import { notFound } from "next/navigation";
import { getDossier } from "@/lib/dossier-network";
import { chapterPath, dossierPath } from "@/lib/dossier-core";
import {
  Breadcrumbs,
  ChapterNav,
  Shell,
  Topics,
  pageMetadata,
  styles,
} from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string; chapter: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, chapter } = await params;
  const dossier = await getDossier(slug);
  const current = dossier?.chapters.find((item) => item.id === chapter);

  return dossier && current
    ? pageMetadata(
        `${current.title} — ${dossier.title}`,
        current.paragraphs[0]?.slice(0, 160) || dossier.description,
        chapterPath(slug, chapter),
        dossier.indexable,
      )
    : { title: "Onderzoeksdeel niet gevonden", robots: { index: false } };
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapter } = await params;
  const dossier = await getDossier(slug);
  const index = dossier?.chapters.findIndex((item) => item.id === chapter) ?? -1;
  if (!dossier || index < 0) notFound();

  const current = dossier.chapters[index];
  const previous = dossier.chapters[index - 1];
  const next = dossier.chapters[index + 1];

  return (
    <main>
      <Shell>
        <Breadcrumbs
          items={[
            { title: "Onderzoeksdossiers", href: "/dossiers" },
            { title: dossier.title, href: dossierPath(slug) },
            { title: current.title, href: chapterPath(slug, chapter) },
          ]}
        />

        <header className={styles.hero}>
          <p className={styles.eyebrow}>
            {current.eyebrow || `Onderzoeksdeel ${String(index + 1).padStart(2, "0")}`}
          </p>
          <h1>{current.title}</h1>
          <Link href={dossierPath(slug)}>Terug naar het onderzoeksoverzicht →</Link>
        </header>

        {!dossier.indexable && <p className={styles.notice}>{dossier.boundaries}</p>}

        <div className={styles.layout}>
          <ChapterNav slug={slug} chapters={dossier.chapters} current={chapter} />
          <article className={styles.reading}>
            {current.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>{paragraph}</p>
            ))}
            {current.points?.length ? (
              <ul>{current.points.map((point) => <li key={point}>{point}</li>)}</ul>
            ) : null}

            <nav className={styles.pager} aria-label="Vorige en volgende onderzoeksdelen">
              {previous && (
                <Link rel="prev" href={chapterPath(slug, previous.id)}>
                  ← {previous.title}
                </Link>
              )}
              {next && (
                <Link rel="next" href={chapterPath(slug, next.id)}>
                  {next.title} →
                </Link>
              )}
            </nav>

            <Link href={`${dossierPath(slug)}#bronnen`}>
              Controleer de bronnen en onderzoeksgrenzen →
            </Link>
            <Topics themes={dossier.themes} />
          </article>
        </div>
      </Shell>
    </main>
  );
}
