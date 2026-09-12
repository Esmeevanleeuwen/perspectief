import Link from "next/link";
import PeopleField from "@/app/components/visuals/PeopleField";
import { getFeaturedArticles as getStaticFeaturedArticles } from "@/app/data/articles";
import { getFeaturedArticles as getCmsFeaturedArticles, mediaPath } from "@/lib/admin/content";
import styles from "./FeaturedArticles.module.css";

function numberMeta(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key];
  return typeof value === "number" ? value : 0;
}

function stringMeta(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : "";
}

export default async function FeaturedArticles() {
  const cmsArticles = await getCmsFeaturedArticles();
  const cmsMain = cmsArticles.find((article) => article.featured_position === "main");

  const featuredArticles = cmsMain
    ? cmsArticles.map((article) => ({
        slug: article.slug,
        title: article.title,
        description: article.summary ?? "",
        image: mediaPath(article.hero_image) ?? "/artikelsad.jpg",
        label: article.eyebrow ?? "ARTIKEL",
        experiences: numberMeta(article.metadata, "experiences"),
        experts: numberMeta(article.metadata, "experts"),
        provinces: numberMeta(article.metadata, "provinces") || undefined,
        date: stringMeta(article.metadata, "display_date"),
        featuredPosition: article.featured_position,
      }))
    : getStaticFeaturedArticles();

  const mainArticle = featuredArticles.find((article) => article.featuredPosition === "main");
  const sideArticles = featuredArticles.filter((article) => article.featuredPosition === "side").slice(0, 2);
  if (!mainArticle) return null;

  return (
    <section id="artikelen" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.journey}>
          <div className={styles.peopleWrap}><PeopleField /></div>
        </div>

        <div className={styles.divider} />

        <header className={styles.header}>
          <h2>Uitgelichte artikelen</h2>
          <p>De belangrijkste maatschappelijke ontwikkelingen, onderzocht vanuit ervaringen en verder uitgewerkt door onze redactie.</p>
        </header>

        <div className={styles.grid}>
          <article className={styles.mainArticle}>
            <span className={styles.number}>01</span>
            <div className={styles.mainBody}>
              <Link href={`/artikelen/${mainArticle.slug}`} className={styles.mainImage}>
                <img src={mainArticle.image} alt={mainArticle.title} />
              </Link>
              <div className={styles.mainInfo}>
                <div className={styles.mainText}>
                  <span className={styles.label}>{mainArticle.label}</span>
                  <Link href={`/artikelen/${mainArticle.slug}`}><h3>{mainArticle.title}</h3></Link>
                  <p>{mainArticle.description}</p>
                  <Link href={`/artikelen/${mainArticle.slug}`} className={styles.readLink}>Lees onderzoek <span>→</span></Link>
                </div>
                <div className={styles.mainStats}>
                  <span>{mainArticle.experiences} ervaringen</span>
                  <span>{mainArticle.experts} deskundigen</span>
                  {mainArticle.provinces && <span>{mainArticle.provinces} provincies</span>}
                  {mainArticle.date && <span>{mainArticle.date}</span>}
                </div>
              </div>
            </div>
          </article>

          <div className={styles.sideArticles}>
            {sideArticles.map((article, index) => (
              <article className={styles.sideArticle} key={article.slug}>
                <span className={styles.number}>{String(index + 2).padStart(2, "0")}</span>
                <Link href={`/artikelen/${article.slug}`} className={styles.sideImage}>
                  <img src={article.image} alt={article.title} />
                </Link>
                <div className={styles.sideText}>
                  <span className={styles.label}>{article.label}</span>
                  <Link href={`/artikelen/${article.slug}`}><h3>{article.title}</h3></Link>
                  <Link href={`/artikelen/${article.slug}`} className={styles.readLink}>Lees onderzoek <span>→</span></Link>
                </div>
                <div className={styles.sideStats}>
                  <span>{article.experiences} ervaringen</span>
                  <span>{article.experts} deskundigen</span>
                  <span>Onderzoek</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <span />
          <Link href="/artikelen">Bekijk alle artikelen <b>→</b></Link>
          <span />
        </div>
      </div>
    </section>
  );
}
