import Image from "next/image";
import Link from "next/link";
import styles from "./CurrentDevelopments.module.css";

// Editorial copy restored from the supplied homepage reference.
// These are curated highlights, not a live database activity stream.
const developments = [
  {
    label: "EUROPA · MIGRATIE",
    title: "Nieuwe afspraken over migratie en arbeid in de EU",
    meta: "4 bronnen · 1 document",
    href: "/onderzoek/ceuta-mei-2021",
  },
  {
    label: "NOORD-AFRIKA · GRENS",
    title: "Grensbeleid verandert sneller dan de publieke discussie",
    meta: "6 bronnen · 2 perspectieven",
    href: "/onderzoek/ceuta-mei-2021",
  },
  {
    label: "ARBEID · RISICO",
    title: "Nieuwe cijfers verschuiven het beeld van fysiek risico",
    meta: "5 bronnen · 2 datasets",
    href: "/dossiers/mens-als-functie",
  },
];

const knowledgeFeed = [
  { time: "16:42", text: "Nieuwe dataset toegevoegd over defensie-uitgaven.", href: "/bronnen" },
  { time: "15:30", text: "Twee nieuwe documenten gekoppeld aan Migratie → Arbeid.", href: "/onderzoek/ceuta-mei-2021" },
  { time: "13:01", text: "Nieuwe ervaring toegevoegd aan het kennisnetwerk.", href: "/methode" },
  { time: "11:22", text: "Ontwikkeling Zorg → Demografie sterker verbonden.", href: "/themas/zorg" },
];

export default function CurrentDevelopments() {
  return (
    <section id="actuele-ontwikkelingen" className={styles.section} aria-labelledby="developments-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>ACTUELE ONTWIKKELINGEN</p>
            <h2 id="developments-heading">Wat beweegt er<br />op dit moment?</h2>
          </div>
          <Link prefetch={false} href="/dossiers" className={styles.textLink}>Bekijk alles <span aria-hidden="true">→</span></Link>
        </header>

        <div className={styles.grid}>
          <article className={styles.feature}>
            <Image
              src="/actuele-ontwikkelingen.webp"
              alt="Gereconstrueerd beeld van twee militairen die elkaar buiten een hand geven."
              fill
              sizes="(max-width: 700px) calc(100vw - 68px), (max-width: 1100px) 55vw, 44vw"
              className={styles.featureImage}
            />
            <div className={styles.featureContent}>
              <p className={styles.featureLabel}>INTERNATIONAAL</p>
              <h3>Toenemende wapenproductie verandert geopolitieke verhoudingen</h3>
              <p className={styles.description}>Nieuwe ontwikkelingen laten zien waar defensie-investeringen toenemen en welke economische en politieke structuren daarmee verschuiven.</p>
              <p className={styles.featureMeta}>8 bronnen <span>·</span> 3 documenten <span>·</span> 2 datasets</p>
              <Link prefetch={false} href="/dossiers/mens-als-functie" className={styles.textLink}>Bekijk ontwikkeling <span aria-hidden="true">→</span></Link>
            </div>
          </article>

          <div className={styles.cards}>
            {developments.map((item) => (
              <Link prefetch={false} key={item.title} href={item.href} className={styles.card}>
                <p className={styles.cardLabel}>{item.label}</p>
                <h3>{item.title}</h3>
                <div className={styles.cardBottom}><span>{item.meta}</span><span className={styles.arrow} aria-hidden="true">→</span></div>
              </Link>
            ))}
          </div>

          <aside className={styles.feed} aria-labelledby="knowledge-feed-heading">
            <div className={styles.feedHeader}>
              <div>
                <h3 id="knowledge-feed-heading">KENNISFEED</h3>
                <p>Recente toevoegingen aan het netwerk.</p>
              </div>
              <Link prefetch={false} href="/bronnen" className={styles.arrow} aria-label="Bekijk de kennisfeed">→</Link>
            </div>
            <ol className={styles.feedList}>
              {knowledgeFeed.map((item) => (
                <li key={item.time}>
                  <span className={styles.feedTime}>{item.time}</span>
                  <span className={styles.dot} aria-hidden="true" />
                  <Link prefetch={false} href={item.href}>{item.text}</Link>
                </li>
              ))}
            </ol>
            <Link prefetch={false} href="/bronnen" className={`${styles.textLink} ${styles.feedLink}`}>Bekijk volledige feed <span aria-hidden="true">→</span></Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
