import Image from "next/image";
import Link from "next/link";
import { getFeaturedResearch } from "@/app/data/research";
import styles from "./FeaturedResearch.module.css";

export type FeaturedResearchDossierLink = {
  slug: string;
  title: string;
};

type FeaturedResearchProps = {
  relatedDossiers?: FeaturedResearchDossierLink[];
};

export default function FeaturedResearch({ relatedDossiers = [] }: FeaturedResearchProps) {
  const research = getFeaturedResearch();
  if (!research) return null;

  return (
    <section className={styles.section} aria-labelledby="featured-research-title">
      <div className={styles.container}>
        <Link
          href={`/onderzoek/${research.slug}`}
          className={styles.imageLink}
          aria-label={`Open onderzoek: ${research.title}`}
        >
          <Image
            src={research.image}
            alt={research.imageAlt}
            fill
            sizes="(max-width: 860px) 100vw, 48vw"
            className={styles.image}
          />
        </Link>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>UITGELICHT ONDERZOEK</p>
          <h2 id="featured-research-title">{research.title}</h2>
          <p className={styles.summary}>{research.summary}</p>

          {relatedDossiers.length > 0 && (
            <div className={styles.related}>
              <p className={styles.relatedLabel}>VERBONDEN DOSSIERS</p>
              <nav className={styles.relatedLinks} aria-label="Dossiers verbonden aan dit onderzoek">
                {relatedDossiers.slice(0, 3).map((dossier, index) => (
                  <Link href={`/dossiers/${dossier.slug}`} key={dossier.slug}>
                    <span className={styles.relatedIndex}>{String(index + 1).padStart(2, "0")}</span>
                    <span>{dossier.title}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          <Link href={`/onderzoek/${research.slug}`} className={styles.link}>
            <span>Volg de informatie</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
