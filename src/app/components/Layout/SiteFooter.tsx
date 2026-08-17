import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.identity}>
          <span className={styles.kicker}>MERIDIAN</span>
          <p>
            Gebeurtenissen, perspectieven, bronnen en onderliggende structuren
            als één verbonden informatieruimte.
          </p>
        </div>

        <nav className={styles.links} aria-label="Voettekst navigatie">
          <Link href="/#ontdek">
            <span>01</span>
            Verken
          </Link>
          <Link href="/artikelen">
            <span>02</span>
            Artikelen
          </Link>
          <Link href="/systeem">
            <span>03</span>
            Het systeem
          </Link>
        </nav>
      </div>

      <div className={styles.bottom}>
        <span>Niemand ziet het volledige verhaal.</span>
        <Link href="/systeem">Zie hoe alles verbonden is →</Link>
      </div>
    </footer>
  );
}
