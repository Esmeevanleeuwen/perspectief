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
    visual: "eu",
  },
  {
    label: "NOORD-AFRIKA · GRENS",
    title: "Grensbeleid verandert sneller dan de publieke discussie",
    meta: "6 bronnen · 2 perspectieven",
    href: "/onderzoek/ceuta-mei-2021",
    visual: "border",
  },
  {
    label: "ARBEID · RISICO",
    title: "Nieuwe cijfers verschuiven het beeld van fysiek risico",
    meta: "5 bronnen · 2 datasets",
    href: "/dossiers/mens-als-functie",
    visual: "risk",
  },
] as const;

const knowledgeFeed = [
  { time: "16:42", text: "Nieuwe dataset toegevoegd over defensie-uitgaven.", href: "/bronnen" },
  { time: "15:30", text: "Twee nieuwe documenten gekoppeld aan Migratie → Arbeid.", href: "/onderzoek/ceuta-mei-2021" },
  { time: "13:01", text: "Nieuwe ervaring toegevoegd aan het kennisnetwerk.", href: "/methode" },
  { time: "11:22", text: "Ontwikkeling Zorg → Demografie sterker verbonden.", href: "/themas/zorg" },
];

function thumbnailClass(visual: (typeof developments)[number]["visual"]) {
  if (visual === "eu") return styles.euThumb;
  if (visual === "border") return styles.borderThumb;
  return styles.riskThumb;
}

export default function CurrentDevelopments() {
  return (
    <section id="actuele-ontwikkelingen" className={styles.section} aria-labelledby="developments-heading">
      <div className={styles.container}>
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <div className={styles.brandLine}>
              <span>MERIDIAN</span>
              <i aria-hidden="true" />
              <span>INZICHT IN EEN VERANDERENDE WERELD</span>
            </div>
            <h2 id="developments-heading">Wat beweegt er op dit moment?</h2>
            <p>
              Actuele ontwikkelingen, diepgaande analyses en data uit ons kennisnetwerk
              over geopolitiek, samenleving en economie.
            </p>
          </div>

          <div className={styles.introContext} aria-hidden="true">
            <div className={styles.networkOrb}>
              <span className={styles.orbDotOne} />
              <span className={styles.orbDotTwo} />
              <span className={styles.orbDotThree} />
            </div>
            <div className={styles.contextStatement}>
              <strong>VERBINDT<br />INZICHTEN<br />MET IMPACT</strong>
              <i />
            </div>
            <p>Van losse signalen<br />naar een completer<br />beeld.</p>
          </div>
        </div>

        <div className={styles.grid}>
          <article className={styles.feature}>
            <Image
              src="/actuele-ontwikkelingen.webp"
              alt="Gereconstrueerd beeld van twee militairen die elkaar buiten een hand geven."
              fill
              sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1180px) calc(100vw - 48px), 43vw"
              className={styles.featureImage}
              priority={false}
            />
            <div className={styles.featureContent}>
              <p className={styles.featureLabel}>INTERNATIONAAL</p>
              <h3>Toenemende wapenproductie verandert geopolitieke verhoudingen</h3>
              <p className={styles.description}>Nieuwe ontwikkelingen laten zien waar defensie-investeringen toenemen en welke economische en politieke structuren daarmee verschuiven.</p>
              <p className={styles.featureMeta}>8 bronnen <span>·</span> 3 documenten <span>·</span> 2 datasets</p>
              <Link prefetch={false} href="/dossiers/mens-als-functie" className={styles.textLink}>Bekijk ontwikkeling <span aria-hidden="true">→</span></Link>
            </div>
          </article>

          <div className={styles.developmentsColumn}>
            <div className={styles.columnHeader}>
              <span>ANDERE ONTWIKKELINGEN</span>
              <i aria-hidden="true" />
              <small>3 UITGELICHT</small>
            </div>

            <div className={styles.cards}>
              {developments.map((item) => (
                <Link prefetch={false} key={item.title} href={item.href} className={styles.card}>
                  <div className={styles.cardCopy}>
                    <p className={styles.cardLabel}>{item.label}</p>
                    <h3>{item.title}</h3>
                    <span className={styles.cardMeta}>{item.meta}</span>
                  </div>

                  <div className={styles.cardVisual}>
                    <span className={styles.arrowCircle} aria-hidden="true">→</span>
                    <span className={styles.thumb + " " + thumbnailClass(item.visual)} aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <aside className={styles.feed} aria-labelledby="knowledge-feed-heading">
              <div className={styles.feedHeader}>
                <div>
                  <h3 id="knowledge-feed-heading">KENNISFEED</h3>
                  <p>Recente toevoegingen aan het netwerk.</p>
                </div>
                <span className={styles.live}><i aria-hidden="true" /> LIVE</span>
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

              <Link prefetch={false} href="/bronnen" className={styles.feedLink}>
                Bekijk volledige feed <span aria-hidden="true">→</span>
              </Link>
            </aside>

            <div className={styles.quoteCard}>
              <blockquote>“Meer samenhang.<br />Dieper inzicht. Grotere impact.”</blockquote>
              <div><i aria-hidden="true" /><span>MERIDIAN</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
