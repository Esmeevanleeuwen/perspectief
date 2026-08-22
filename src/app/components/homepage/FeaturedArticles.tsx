import Link from "next/link";
import PeopleField from "@/app/components/visuals/PeopleField";
import { getFeaturedArticles } from "@/app/data/articles";
import styles from "./FeaturedArticles.module.css";

export default function FeaturedArticles() {
  const featuredArticles = getFeaturedArticles();
  const mainArticle = featuredArticles.find((article) => article.featuredPosition === "main");
  const sideArticles = featuredArticles.filter((article) => article.featuredPosition === "side");
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
                  <span>{mainArticle.date}</span>
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
