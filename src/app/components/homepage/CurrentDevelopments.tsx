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
  { time: "16:42", label: "DEFENSIE", text: "Nieuwe dataset toegevoegd over defensie-uitgaven.", href: "/bronnen" },
  { time: "15:30", label: "MIGRATIE · ARBEID", text: "Twee nieuwe documenten gekoppeld aan Migratie → Arbeid.", href: "/onderzoek/ceuta-mei-2021" },
  { time: "13:01", label: "SYSTEEM", text: "Nieuwe ervaring toegevoegd aan het kennisnetwerk.", href: "/methode" },
  { time: "11:22", label: "ZORG · DEMOGRAFIE", text: "Ontwikkeling Zorg → Demografie sterker verbonden.", href: "/themas/zorg" },
];

export default function CurrentDevelopments() {
  const [leadDevelopment, ...relatedDevelopments] = developments;

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
              sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1100px) calc(100vw - 48px), 38vw"
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

          <div className={styles.networkPanel}>
            <article className={styles.leadStory}>
              <p className={styles.cardLabel}>{leadDevelopment.label}</p>
              <h3>{leadDevelopment.title}</h3>
              <p className={styles.leadMeta}>{leadDevelopment.meta}</p>

              <div className={styles.topicTags} aria-label="Verbonden onderwerpen">
                <span>Migratie</span>
                <span>Arbeid</span>
                <span>EU</span>
                <span>Demografie</span>
              </div>

              <Link prefetch={false} href={leadDevelopment.href} className={styles.storyLink}>
                Bekijk ontwikkeling <span aria-hidden="true">→</span>
              </Link>
            </article>

            <div className={styles.networkGraph} aria-label="Visuele verbinding tussen actuele thema's">
              <svg className={styles.networkSvg} viewBox="0 0 160 520" preserveAspectRatio="none" aria-hidden="true">
                <path d="M82 8 C126 86 45 165 83 246 C116 315 55 391 91 512" />
                <path d="M70 10 C28 92 116 172 70 270 C43 329 102 414 72 510" />
              </svg>
              <div className={styles.networkNode + " " + styles.nodeEuropa}><span />EUROPA</div>
              <div className={styles.networkNode + " " + styles.nodeMigratie}><span />MIGRATIE</div>
              <div className={styles.networkNode + " " + styles.nodeArbeid}><span />ARBEID</div>
              <div className={styles.networkNode + " " + styles.nodeDemografie}><span />DEMOGRAFIE</div>
              <div className={styles.networkNode + " " + styles.nodeZorg}><span />ZORG</div>
            </div>

            <div className={styles.relatedStories}>
              {relatedDevelopments.map((item) => (
                <Link prefetch={false} key={item.title} href={item.href} className={styles.relatedStory}>
                  <div>
                    <p className={styles.cardLabel}>{item.label}</p>
                    <h3>{item.title}</h3>
                    <p>{item.meta}</p>
                  </div>
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </Link>
              ))}
            </div>

            <aside className={styles.feed} aria-labelledby="knowledge-feed-heading">
              <div className={styles.feedHeader}>
                <div>
                  <div className={styles.feedTitleRow}>
                    <span className={styles.feedRing} aria-hidden="true" />
                    <h3 id="knowledge-feed-heading">KENNISFEED</h3>
                  </div>
                  <p>Recente toevoegingen aan het netwerk.</p>
                </div>
                <span className={styles.liveStatus}><i aria-hidden="true" /> NU LIVE</span>
              </div>

              <ol className={styles.feedList}>
                {knowledgeFeed.map((item) => (
                  <li key={item.time}>
                    <span className={styles.feedTime}>{item.time}</span>
                    <span className={styles.dot} aria-hidden="true" />
                    <div>
                      <span className={styles.feedLabel}>{item.label}</span>
                      <Link prefetch={false} href={item.href}>{item.text}</Link>
                    </div>
                  </li>
                ))}
              </ol>

              <Link prefetch={false} href="/bronnen" className={styles.textLink + " " + styles.feedLink}>Bekijk volledige feed <span aria-hidden="true">→</span></Link>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
