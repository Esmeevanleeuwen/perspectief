import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDbContentBySlug } from "@/lib/meridian/content";
import DatabaseResearch from "@/app/components/database/DatabaseResearch";

import { getArticlesForResearch } from "@/app/data/articles";
import {
  getResearchBySlug,
  research as allResearch,
} from "@/app/data/research";

import styles from "./page.module.css";


type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return allResearch.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  // Eerst proberen uit Supabase
  const dbItem = await getDbContentBySlug(slug);

  if (
    dbItem &&
    dbItem.status === "published" &&
    dbItem.content_type === "research"
  ) {
    return {
      title: `${dbItem.title} | Meridian`,
      description: dbItem.summary ?? "Onderzoek op Meridian",
    };
  }

  // Daarna fallback naar bestaande lokale data
  const item = getResearchBySlug(slug);

  if (!item) {
    return {
      title: "Onderzoek | Meridian",
    };
  }

  return {
    title: `${item.title} | Meridian`,
    description: item.summary,
  };
}

export default async function ResearchPage({ params }: Props) {
  const { slug } = await params;

  // Eerst Supabase controleren
  const dbItem = await getDbContentBySlug(slug);

  if (
    dbItem &&
    dbItem.status === "published" &&
    dbItem.content_type === "research"
  ) {
    return <DatabaseResearch item={dbItem} />;
  }

  // Fallback naar bestaande research.ts
  const research = getResearchBySlug(slug);

  if (!research) {
    notFound();
  }

  const relatedArticles = getArticlesForResearch(research.slug);

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumbs}>
        <Link href="/">Meridian</Link>

        <span>→</span>

        <span>Onderzoek</span>

        <span>→</span>

        <span>{research.title}</span>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroImage}>
          <Image
            src={research.image}
            alt={research.imageAlt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            {research.label}
          </p>

          <h1>
            {research.title}
          </h1>

          <p className={styles.summary}>
            {research.summary}
          </p>

          <div className={styles.dimensions}>
            {research.dimensions.map((dimension) => (
              <span key={dimension}>
                {dimension}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className={styles.thesis}>
        <p>
          De centrale vraag
        </p>

        <h2>
          {research.question}
        </h2>

        <div>
          {research.method}
        </div>
      </section>

      <div className={styles.sections}>
        {research.sections.map((section, index) => (
          <section
            className={styles.researchSection}
            id={section.id}
            key={section.id}
          >
            <aside>
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>

              {section.eyebrow && (
                <p>
                  {section.eyebrow}
                </p>
              )}
            </aside>

            <div className={styles.sectionContent}>
              <h2>
                {section.title}
              </h2>

              {section.intro && (
                <p className={styles.sectionIntro}>
                  {section.intro}
                </p>
              )}

              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>
                  {paragraph}
                </p>
              ))}

              {section.points && (
                <div className={styles.points}>
                  {section.points.map((point) => (
                    <div key={point}>
                      <span />

                      <p>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <section className={styles.articlesSection}>
        <div className={styles.articlesHeader}>
          <div>
            <p className={styles.eyebrow}>
              Uit het onderzoek
            </p>

            <h2>
              Artikelen ontstaan vanuit het dossier.
            </h2>
          </div>

          <p>
            Het onderzoek is de bredere kennisstructuur.
            Artikelen zoomen in op een casus, perspectief,
            document of ontwikkeling die binnen dat
            onderzoek relevant wordt.
          </p>
        </div>

        {relatedArticles.length > 0 ? (
          <div className={styles.articleGrid}>
            {relatedArticles.map((article) => (
              <Link
                href={`/artikelen/${article.slug}`}
                className={styles.articleCard}
                key={article.slug}
              >
                <div className={styles.articleImage}>
                  <img
                    src={article.image}
                    alt={article.title}
                  />
                </div>

                <div className={styles.articleCopy}>
                  <span>
                    {article.label}
                  </span>

                  <h3>
                    {article.title}
                  </h3>

                  <p>
                    {article.description}
                  </p>

                  <b>
                    Lees artikel →
                  </b>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Voor dit onderzoek zijn nog geen afzonderlijke
            artikelen gepubliceerd.
          </p>
        )}
      </section>

      <footer className={styles.footer}>
        <Link href="/artikelen">
          Bekijk alle artikelen →
        </Link>

        <Link href="/methode">
          Bekijk onze methode →
        </Link>
      </footer>
    </main>
  );
}