import Image from "next/image";
import Link from "next/link";
import { getFeaturedResearch } from "@/app/data/research";
import styles from "./FeaturedResearch.module.css";

export default function FeaturedResearch() {
  const research = getFeaturedResearch();
  if (!research) return null;

  return (
    <section className={styles.section} aria-labelledby="featured-research-title">
      <div className={styles.container}>
        <Link href={`/onderzoek/${research.slug}`} className={styles.imageLink}>
          <Image src={research.image} alt={research.imageAlt} fill sizes="(max-width: 860px) 100vw, 48vw" className={styles.image} />
        </Link>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>UITGELICHT ONDERZOEK</p>
          <h2 id="featured-research-title">{research.title}</h2>
          <p className={styles.summary}>{research.summary}</p>

          <div className={styles.dimensions}>
            {research.dimensions.map((dimension) => <span key={dimension}>{dimension}</span>)}
          </div>

          <Link href={`/onderzoek/${research.slug}`} className={styles.link}>
            <span>Volg de informatie</span><span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
