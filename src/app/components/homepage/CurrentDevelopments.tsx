import Link from "next/link";

import styles from "./CurrentDevelopments.module.css";

const sideDevelopments = [
  {
    category: "EUROPA · MIGRATIE",
    title: "Nieuwe afspraken over migratie en arbeid in de EU",
    meta: "4 bronnen · 1 document",
    href: "/ontwikkelingen/migratie-arbeid-europa",
  },
  {
    category: "NOORD-AFRIKA · GRENS",
    title: "Grensbeleid verandert sneller dan de publieke discussie",
    meta: "6 bronnen · 2 perspectieven",
    href: "/ontwikkelingen/grensbeleid-noord-afrika",
  },
  {
    category: "ARBEID · RISICO",
    title: "Nieuwe cijfers verschuiven het beeld van fysiek risico",
    meta: "5 bronnen · 2 datasets",
    href: "/ontwikkelingen/arbeid-risico",
  },
];

const knowledgeFeed = [
  {
    time: "16:42",
    text: "Nieuwe dataset toegevoegd over defensie-uitgaven.",
  },
  {
    time: "15:30",
    text: "Twee nieuwe documenten gekoppeld aan Migratie → Arbeid.",
  },
  {
    time: "13:01",
    text: "Nieuwe ervaring toegevoegd aan het kennisnetwerk.",
  },
  {
    time: "11:22",
    text: "Ontwikkeling Zorg → Demografie sterker verbonden.",
  },
];

export default function CurrentDevelopments() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div>
            <p className={styles.eyebrow}>
              ACTUELE ONTWIKKELINGEN
            </p>

            <h2>
              Wat beweegt er
              <br />
              op dit moment?
            </h2>
          </div>

          <Link href="/ontwikkelingen" className={styles.viewAll}>
            Bekijk alles <span>→</span>
          </Link>
        </div>

        <div className={styles.layout}>
          <div className={styles.newsColumn}>
            <Link
              href="/ontwikkelingen/wapenproductie-geopolitiek"
              className={styles.mainCard}
            >
              <div className={styles.mainImage}>
                <img
                  src="./20250715hjh0065.jpg"
                  alt="Defensie en wapenproductie"
                />

                <div className={styles.imageOverlay} />

                <div className={styles.mainContent}>
                  <span className={styles.category}>
                    INTERNATIONAAL
                  </span>

                  <h3>
                    Toenemende wapenproductie verandert
                    geopolitieke verhoudingen
                  </h3>

                  <p>
                    Nieuwe ontwikkelingen laten zien waar
                    defensie-investeringen toenemen en welke
                    economische en politieke structuren daarmee
                    verschuiven.
                  </p>

                  <div className={styles.mainMeta}>
                    <span>8 bronnen</span>
                    <i />
                    <span>3 documenten</span>
                    <i />
                    <span>2 datasets</span>
                  </div>

                  <div className={styles.readMore}>
                    Bekijk ontwikkeling <b>→</b>
                  </div>
                </div>
              </div>
            </Link>

            <div className={styles.sideGrid}>
              {sideDevelopments.map((item) => (
                <Link
                  href={item.href}
                  key={item.href}
                  className={styles.smallCard}
                >
                  <span className={styles.smallCategory}>
                    {item.category}
                  </span>

                  <h3>{item.title}</h3>

                  <p>{item.meta}</p>

                  <span className={styles.smallArrow}>→</span>
                </Link>
              ))}
            </div>
          </div>

          <aside className={styles.feed}>
            <div className={styles.feedHeader}>
              <div>
                <p>KENNISFEED</p>
                <span>
                  Recente toevoegingen aan het netwerk.
                </span>
              </div>

              <Link href="/kennisfeed">→</Link>
            </div>

            <div className={styles.feedItems}>
              {knowledgeFeed.map((item) => (
                <div className={styles.feedItem} key={item.time}>
                  <time>{item.time}</time>

                  <span className={styles.dot} />

                  <p>{item.text}</p>
                </div>
              ))}
            </div>

            <Link href="/kennisfeed" className={styles.feedLink}>
              Bekijk volledige feed <span>→</span>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}