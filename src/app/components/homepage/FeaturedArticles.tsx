import Link from "next/link";
import {
  getFeaturedArticles,
} from "@/app/data/articles";

import styles from "./FeaturedArticles.module.css";

export default function FeaturedArticles() {
  const featuredArticles = getFeaturedArticles();

  const mainArticle = featuredArticles.find(
    (article) => article.featuredPosition === "main"
  );

  const sideArticles = featuredArticles.filter(
    (article) => article.featuredPosition === "side"
  );

  if (!mainArticle) {
    return null;
  }

  return (
    <section id="artikelen" className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2>Uitgelichte artikelen</h2>

          <p>
            De belangrijkste maatschappelijke ontwikkelingen,
            onderzocht vanuit ervaringen en verder uitgewerkt
            door onze redactie.
          </p>
        </header>

        <div className={styles.grid}>
          <article className={styles.mainCard}>
            <Link
              href={`/artikelen/${mainArticle.slug}`}
              className={styles.mainImage}
            >
              <img
                src={mainArticle.image}
                alt={mainArticle.title}
              />
            </Link>

            <div className={styles.mainContent}>
              <span className={styles.label}>
                {mainArticle.label}
              </span>

              <Link
                href={`/artikelen/${mainArticle.slug}`}
              >
                <h3>{mainArticle.title}</h3>
              </Link>

              <p className={styles.description}>
                {mainArticle.description}
              </p>

              <div className={styles.meta}>
                <span>
                  {mainArticle.experiences} ervaringen
                </span>

                <span>
                  {mainArticle.experts} deskundigen
                </span>

                {mainArticle.provinces && (
                  <span>
                    {mainArticle.provinces} provincies
                  </span>
                )}

                <span>{mainArticle.date}</span>
              </div>

              <Link
                href={`/artikelen/${mainArticle.slug}`}
                className={styles.readLink}
              >
                Lees onderzoek <span>→</span>
              </Link>
            </div>
          </article>

          <div className={styles.side}>
            {sideArticles.map((article) => (
              <article
                className={styles.smallCard}
                key={article.slug}
              >
                <Link
                  href={`/artikelen/${article.slug}`}
                  className={styles.smallImage}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                  />
                </Link>

                <div className={styles.smallContent}>
                  <div className={styles.smallText}>
                    <span className={styles.label}>
                      {article.label}
                    </span>

                    <Link
                      href={`/artikelen/${article.slug}`}
                    >
                      <h3>{article.title}</h3>
                    </Link>

                    <span className={styles.experience}>
                      {article.experiences} ervaringen
                    </span>

                    <Link
                      href={`/artikelen/${article.slug}`}
                      className={styles.readLink}
                    >
                      Lees onderzoek <span>→</span>
                    </Link>
                  </div>

                  <div className={styles.stats}>
                    <span>Gebaseerd op</span>

                    <strong>
                      {article.experiences} ervaringen
                    </strong>

                    <span className={styles.arrow}>
                      ↓
                    </span>

                    <strong>
                      {article.experts} deskundigen
                    </strong>

                    <span className={styles.arrow}>
                      ↓
                    </span>

                    <span>Onderzoek</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <span />

          <Link href="/artikelen">
            Bekijk alle artikelen <b>→</b>
          </Link>

          <span />
        </div>
      </div>
    </section>
  );
}
