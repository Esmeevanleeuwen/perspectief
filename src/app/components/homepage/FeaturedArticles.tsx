import Link from "next/link";
import styles from "./FeaturedArticles.module.css";

const articles = {
  main: {
    label: "ONDERZOEK",
    title: "Waarom ervaren steeds meer jongeren prestatiedruk?",
    description:
      "Een onderzoek naar de ervaringen van jongeren, de terugkerende patronen en de mogelijke oorzaken.",
    image: "/prestatiedruk.jpg",
    experiences: "438 ervaringen",
    experts: "12 deskundigen",
    extra: "11 provincies",
    date: "18 juli 2026",
    href: "/artikelen/prestatiedruk",
  },

  secondary: [
    {
      label: "ONDERZOEK",
      title: "Waarom verlaten steeds meer leraren het onderwijs?",
      image: "/onderwijs.jpg",
      experiences: "241 ervaringen",
      experts: "8 deskundigen",
      href: "/artikelen/leraren-onderwijs",
    },
    {
      label: "ONDERZOEK",
      title: "Waarom groeit het gevoel van woningonzekerheid?",
      image: "/woningonzekerheid.jpg",
      experiences: "517 ervaringen",
      experts: "16 deskundigen",
      href: "/artikelen/woningonzekerheid",
    },
  ],
};

export default function FeaturedArticles() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2>Uitgelichte artikelen</h2>

          <p>
            De belangrijkste maatschappelijke ontwikkelingen,
            onderzocht vanuit ervaringen en verder uitgewerkt door onze redactie.
          </p>
        </header>

        <div className={styles.grid}>
          <article className={styles.mainCard}>
            <Link href={articles.main.href} className={styles.mainImage}>
              <img
                src={articles.main.image}
                alt={articles.main.title}
              />
            </Link>

            <div className={styles.mainContent}>
              <span className={styles.label}>
                {articles.main.label}
              </span>

              <Link href={articles.main.href}>
                <h3>{articles.main.title}</h3>
              </Link>

              <p className={styles.description}>
                {articles.main.description}
              </p>

              <div className={styles.meta}>
                <span>{articles.main.experiences}</span>
                <span>{articles.main.experts}</span>
                <span>{articles.main.extra}</span>
                <span>{articles.main.date}</span>
              </div>

              <Link
                href={articles.main.href}
                className={styles.readLink}
              >
                Lees onderzoek <span>→</span>
              </Link>
            </div>
          </article>

          <div className={styles.side}>
            {articles.secondary.map((article) => (
              <article className={styles.smallCard} key={article.href}>
                <Link
                  href={article.href}
                  className={styles.smallImage}
                >
                  <img src={article.image} alt={article.title} />
                </Link>

                <div className={styles.smallContent}>
                  <div className={styles.smallText}>
                    <span className={styles.label}>
                      {article.label}
                    </span>

                    <Link href={article.href}>
                      <h3>{article.title}</h3>
                    </Link>

                    <span className={styles.experience}>
                      {article.experiences}
                    </span>

                    <Link
                      href={article.href}
                      className={styles.readLink}
                    >
                      Lees onderzoek <span>→</span>
                    </Link>
                  </div>

                  <div className={styles.stats}>
                    <span>Gebaseerd op</span>
                    <strong>{article.experiences}</strong>
                    <span className={styles.arrow}>↓</span>
                    <strong>{article.experts}</strong>
                    <span className={styles.arrow}>↓</span>
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