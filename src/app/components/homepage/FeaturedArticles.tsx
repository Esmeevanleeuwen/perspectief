import Link from "next/link";

import { getFeaturedArticles } from "@/app/data/articles";
import { getPublishedDbArticles } from "@/lib/meridian/content";

import PeopleField from "./PeopleField.module";
import styles from "./FeaturedArticles.module.css";

export default async function FeaturedArticles() {
  const dbArticles = await getPublishedDbArticles();

  const dbFeatured = dbArticles.filter((item) => item.featured);

  const localFeatured = getFeaturedArticles();

  const dbSlugs = new Set(dbFeatured.map((item) => item.slug));

  const fallbackLocal = localFeatured.filter(
    (item) => !dbSlugs.has(item.slug)
  );

  const allFeatured = [
    ...dbFeatured.map((item) => ({
      slug: item.slug,
      label: item.eyebrow ?? "ARTIKEL",
      title: item.title,
      description: item.summary ?? "",
      image: item.hero_image ?? "/onderzoek-tegenspraak.jpg",
      experiences: 0,
      experts: 0,
      provinces: undefined as number | undefined,
      date: item.published_at
        ? new Date(item.published_at).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "",
      featuredPosition:
        item.featured_position === "main" ||
        item.featured_position === "side"
          ? item.featured_position
          : undefined,
    })),

    ...fallbackLocal,
  ];

  const mainArticle =
    allFeatured.find(
      (article) => article.featuredPosition === "main"
    ) ?? allFeatured[0];

  const sideArticles = allFeatured
    .filter((article) => article.slug !== mainArticle?.slug)
    .slice(0, 2);

  if (!mainArticle) {
    return null;
  }

  return (
    <section id="artikelen" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.journey}>
          <div className={styles.peopleWrap}>
            <PeopleField />
          </div>
        </div>

        <header className={styles.header}>
          <h2>Uitgelichte artikelen</h2>

          <p>
            De belangrijkste maatschappelijke ontwikkelingen,
            onderzocht vanuit ervaringen en verder uitgewerkt
            door onze redactie.
          </p>
        </header>

        <div className={styles.grid}>
          <article className={styles.mainArticle}>
            <span className={styles.number}>01</span>

            <div>
              <Link
                href={`/artikelen/${mainArticle.slug}`}
                className={styles.mainImage}
              >
                <img
                  src={mainArticle.image}
                  alt={mainArticle.title}
                />
              </Link>

              <div className={styles.mainInfo}>
                <div className={styles.mainText}>
                  <span className={styles.label}>
                    {mainArticle.label}
                  </span>

                  <Link href={`/artikelen/${mainArticle.slug}`}>
                    <h3>{mainArticle.title}</h3>
                  </Link>

                  <p>{mainArticle.description}</p>

                  <Link
                    href={`/artikelen/${mainArticle.slug}`}
                    className={styles.readLink}
                  >
                    Lees artikel <span>→</span>
                  </Link>
                </div>

                <div className={styles.mainStats}>
                  {mainArticle.experiences > 0 && (
                    <span>
                      {mainArticle.experiences} ervaringen
                    </span>
                  )}

                  {mainArticle.experts > 0 && (
                    <span>
                      {mainArticle.experts} deskundigen
                    </span>
                  )}

                  {mainArticle.provinces && (
                    <span>
                      {mainArticle.provinces} provincies
                    </span>
                  )}

                  {mainArticle.date && (
                    <span>{mainArticle.date}</span>
                  )}
                </div>
              </div>
            </div>
          </article>

          <div className={styles.sideArticles}>
            {sideArticles.map((article, index) => (
              <article
                className={styles.sideArticle}
                key={article.slug}
              >
                <span className={styles.number}>
                  {String(index + 2).padStart(2, "0")}
                </span>

                <Link
                  href={`/artikelen/${article.slug}`}
                  className={styles.sideImage}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                  />
                </Link>

                <div className={styles.sideText}>
                  <span className={styles.label}>
                    {article.label}
                  </span>

                  <Link href={`/artikelen/${article.slug}`}>
                    <h3>{article.title}</h3>
                  </Link>

                  <Link
                    href={`/artikelen/${article.slug}`}
                    className={styles.readLink}
                  >
                    Lees artikel <span>→</span>
                  </Link>
                </div>

                <div className={styles.sideStats}>
                  {article.experiences > 0 && (
                    <span>
                      {article.experiences} ervaringen
                    </span>
                  )}

                  {article.experts > 0 && (
                    <span>
                      {article.experts} deskundigen
                    </span>
                  )}

                  <span>Artikel</span>
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