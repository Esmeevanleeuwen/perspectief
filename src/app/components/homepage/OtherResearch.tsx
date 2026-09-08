import Link from "next/link";
import styles from "./OtherResearch.module.css";

export type OtherResearchItem = {
  slug: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

type OtherResearchProps = {
  items: OtherResearchItem[];
};

export default function OtherResearch({ items }: OtherResearchProps) {
  if (!items.length) return null;

  return (
    <section id="ontdek" className={styles.section} aria-labelledby="other-research-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>MEER ONDERZOEK</p>
            <h2 id="other-research-title">Andere onderzoeken</h2>
          </div>
          <Link href="/dossiers" className={styles.allLink}>
            <span>Bekijk alle dossiers</span>
            <span aria-hidden="true">→</span>
          </Link>
        </header>

        <div className={styles.list}>
          {items.slice(0, 3).map((item, index) => (
            <article className={styles.item} key={item.slug}>
              <Link
                href={`/dossiers/${item.slug}`}
                className={styles.imageLink}
                aria-label={`Open dossier: ${item.title}`}
              >
                <img src={item.image} alt={item.imageAlt} loading="lazy" />
              </Link>

              <div className={styles.copy}>
                <div className={styles.meta}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>ONDERZOEK</span>
                </div>
                <h3>
                  <Link href={`/dossiers/${item.slug}`}>{item.title}</Link>
                </h3>
                {item.description && <p>{item.description}</p>}
                <Link href={`/dossiers/${item.slug}`} className={styles.readLink}>
                  <span>Bekijk onderzoek</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
