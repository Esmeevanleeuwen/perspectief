import Link from "next/link";
import AccountNavLink from "./AccountNavLink";
import SiteHeaderNav from "./SiteHeaderNav";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.shell}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Meridian home">
          <svg className={styles.logoMark} viewBox="0 0 48 42" aria-hidden="true">
            <path
              d="M6 31V6L24 21L42 6V31"
              fill="none"
              stroke="currentColor"
              strokeWidth="5.2"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            <circle cx="24" cy="35.5" r="3.8" fill="currentColor" />
          </svg>
          <span className={styles.brandName}>MERIDIAN</span>
        </Link>

        <SiteHeaderNav />

        <div className={styles.accountLink}>
          <AccountNavLink />
        </div>
      </div>
    </header>
  );
}
