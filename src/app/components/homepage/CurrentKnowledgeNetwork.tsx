import Link from "next/link";
import styles from "./CurrentKnowledgeNetwork.module.css";

const developments = [
  {
    label: "EUROPA · MIGRATIE",
    title: "Nieuwe afspraken over migratie en arbeid in de EU",
    description:
      "EU-lidstaten bereiken een nieuw akkoord over migratie en arbeid, met meer focus op talent, eerlijke arbeidsmobiliteit en gezamenlijke verantwoordelijkheid.",
    meta: "4 bronnen · 1 document",
    tags: ["Migratie", "Arbeid", "EU", "Demografie"],
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
  { time: "15:30", label: "MIGRATIE · ARBEID", text: "Twee nieuwe documenten gekoppeld aan Migratie — Arbeid.", href: "/onderzoek/ceuta-mei-2021" },
  { time: "13:01", label: "SYSTEEM", text: "Nieuwe ervaring toegevoegd aan het kennisnetwerk.", href: "/methode" },
  { time: "11:22", label: "ZORG · DEMOGRAFIE", text: "Ontwikkeling Zorg → Demografie sterker verbonden.", href: "/themas/zorg" },
];

export default function CurrentKnowledgeNetwork() {
  const [lead, ...rest] = developments;

  return (
    <section className={styles.section} aria-labelledby="knowledge-network-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>ACTUEEL IN HET KENNISNETWERK</p>
            <h2 id="knowledge-network-heading">Inzichten verbinden. Een completer beeld.</h2>
          </div>
          <Link prefetch={false} href="/bronnen" className={styles.headerLink}>
            Bekijk volledig netwerk <span aria-hidden="true">→</span>
          </Link>
        </header>

        <div className={styles.grid}>
          <div className={styles.left}>
            <article className={styles.leadCard}>
              <p className={styles.label}>{lead.label}</p>
              <h3>{lead.title}</h3>
              <p className={styles.description}>{lead.description}</p>
              <p className={styles.meta}>{lead.meta}</p>

              <div className={styles.tags}>
                {lead.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <Link prefetch={false} href={lead.href} className={styles.inlineLink}>
                Bekijk ontwikkeling <span aria-hidden="true">→</span>
              </Link>
            </article>

            <div className={styles.relatedList}>
              {rest.map((item) => (
                <Link key={item.title} prefetch={false} href={item.href} className={styles.relatedItem}>
                  <div>
                    <p className={styles.label}>{item.label}</p>
                    <h3>{item.title}</h3>
                    <p className={styles.meta}>{item.meta}</p>
                  </div>
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.network}>
            <svg viewBox="0 0 200 620" className={styles.networkSvg} preserveAspectRatio="none" aria-hidden="true">
              <path d="M108 10 C158 94 70 176 108 286 C138 372 84 455 118 610" />
              <path d="M94 10 C42 112 132 208 92 330 C64 404 122 495 92 610" />
            </svg>

            <div className={styles.node + " " + styles.europa}><span />EUROPA</div>
            <div className={styles.node + " " + styles.migratie}><span />MIGRATIE</div>
            <div className={styles.node + " " + styles.arbeid}><span />ARBEID</div>
            <div className={styles.node + " " + styles.demografie}><span />DEMOGRAFIE</div>
            <div className={styles.node + " " + styles.zorg}><span />ZORG</div>
          </div>

          <aside className={styles.feed}>
            <div className={styles.feedHeader}>
              <div>
                <div className={styles.feedTitleRow}>
                  <span className={styles.feedRing} aria-hidden="true" />
                  <h3>KENNISFEED</h3>
                </div>
                <p>Recente toevoegingen aan het netwerk.</p>
              </div>
              <span className={styles.live}><i aria-hidden="true" /> NU LIVE</span>
            </div>

            <ol className={styles.feedList}>
              {knowledgeFeed.map((item) => (
                <li key={item.time}>
                  <span className={styles.time}>{item.time}</span>
                  <span className={styles.dot} aria-hidden="true" />
                  <div>
                    <span className={styles.feedLabel}>{item.label}</span>
                    <Link prefetch={false} href={item.href}>{item.text}</Link>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </section>
  );
}
