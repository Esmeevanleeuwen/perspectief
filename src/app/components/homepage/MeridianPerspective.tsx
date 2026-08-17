import Link from "next/link";
import Image from "next/image";

import styles from "./MeridianPerspective.module.css";

export default function MeridianPerspective() {
  return (
    <section className={styles.section} aria-labelledby="meridian-perspective-title">
      <div className={styles.container}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Hoe Meridian kijkt</p>

          <h2 id="meridian-perspective-title">
            De waarheid
            <br />
            ontstaat tussen
            <br />
            perspectieven.
          </h2>

          <div className={styles.keywords} aria-label="Kernbegrippen">
            <span>Perspectief</span>
            <span aria-hidden="true">•</span>
            <span>Verband</span>
            <span aria-hidden="true">•</span>
            <span>Betekenis</span>
          </div>

          <Link href="/systeem" className={styles.link}>
            <span>Ontdek het systeem</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.network}>
            <span className={styles.nodeOne} />
            <span className={styles.nodeTwo} />
            <span className={styles.nodeThree} />
            <span className={styles.nodeFour} />
            <span className={styles.lineOne} />
            <span className={styles.lineTwo} />
            <span className={styles.lineThree} />
          </div>

          <div className={styles.imageWrap}>
            <Image
              src="/meridian-lungs.png"
              alt=""
              fill
              priority={false}
              sizes="(max-width: 900px) 78vw, 44vw"
              className={styles.image}
            />
          </div>

          <div className={styles.shadow} />
        </div>
      </div>
    </section>
  );
}
