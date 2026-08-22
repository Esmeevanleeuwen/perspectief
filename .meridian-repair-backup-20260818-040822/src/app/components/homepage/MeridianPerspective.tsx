import Link from "next/link";
import Image from "next/image";

import styles from "./MeridianPerspective.module.css";

export default function MeridianPerspective() {
  return (
    <header
      className={styles.section}
      aria-labelledby="meridian-method-title"
    >
      <div className={styles.container}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Onze methode</p>

          <h1 id="meridian-method-title">
            De waarheid
            <br />
            ontstaat tussen
            <br />
            perspectieven.
          </h1>

          <p className={styles.lead}>
            Niet één ervaring is het volledige verhaal. Meridian verzamelt
            verschillende informatieposities, zoekt terugkerende patronen en
            onderzoekt vervolgens wat aantoonbaar is.
          </p>

          <div className={styles.keywords} aria-label="Stappen van de methode">
            <span>Ervaring</span>
            <span aria-hidden="true">•</span>
            <span>Patroon</span>
            <span aria-hidden="true">•</span>
            <span>Onderzoek</span>
            <span aria-hidden="true">•</span>
            <span>Inzicht</span>
          </div>

          <Link href="#methode" className={styles.link}>
            <span>Bekijk hoe we werken</span>
            <span aria-hidden="true">↓</span>
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
              priority
              sizes="(max-width: 900px) 78vw, 44vw"
              className={styles.image}
            />
          </div>

          <div className={styles.shadow} />
        </div>
      </div>
    </header>
  );
}
