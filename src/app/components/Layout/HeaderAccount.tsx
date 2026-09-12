"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { safeNext } from "@/lib/auth/paths";
import { signOut } from "@/app/(auth)/actions";
import SubmitButton from "@/components/account/SubmitButton";
import styles from "./SiteHeader.module.css";

function AccountIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21v-2a7 7 0 0114 0v2" />
    </svg>
  );
}

export default function HeaderAccount({
  signedIn,
  variant = "header",
}: {
  signedIn: boolean;
  variant?: "header" | "mobile";
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const next =
    pathname === "/"
      ? "/account"
      : safeNext(pathname + (search ? `?${search}` : ""));
  const params = `?next=${encodeURIComponent(next)}`;

  if (variant === "mobile") {
    return (
      <section className={styles.mobileAccount} aria-label="Je account">
        <div className={styles.mobileAccountTitle}>
          <AccountIcon />
          <strong>Mijn Meridian</strong>
        </div>
        {signedIn ? (
          <>
            <nav
              className={styles.accountShortcuts}
              aria-label="Accountnavigatie"
            >
              <Link href="/account">
                Mijn overzicht <span aria-hidden="true">→</span>
              </Link>
              <Link href="/account/bibliotheek">
                Bibliotheek <span aria-hidden="true">→</span>
              </Link>
              <Link href="/account/opgeslagen">
                Opgeslagen <span aria-hidden="true">→</span>
              </Link>
              <Link href="/account/profiel">
                Profiel & privacy <span aria-hidden="true">→</span>
              </Link>
            </nav>
            <form action={signOut}>
              <SubmitButton
                className={styles.signOut}
                pendingLabel="Uitloggen…"
              >
                Uitloggen
              </SubmitButton>
            </form>
          </>
        ) : (
          <>
            <p>Je bibliotheek, bewaarde artikelen en persoonlijke teksten.</p>
            <div className={styles.mobileAccountButtons}>
              <Link href={"/login" + params} className={styles.loginButton}>
                <AccountIcon />
                Inloggen
              </Link>
              <Link
                href={"/registreren" + params}
                className={styles.registerButton}
              >
                Account maken
              </Link>
            </div>
          </>
        )}
      </section>
    );
  }

  return (
    <div className={styles.accountActions}>
      {signedIn ? (
        <Link href="/account" className={styles.loginButton}>
          <AccountIcon />
          <span className={styles.desktopAccountLabel}>Mijn Meridian</span>
          <span className={styles.mobileAccountLabel}>Mijn account</span>
          <span className={styles.accountArrow} aria-hidden="true">
            ↗
          </span>
        </Link>
      ) : (
        <>
          <Link href={"/registreren" + params} className={styles.registerLink}>
            Account maken
          </Link>
          <Link href={"/login" + params} className={styles.loginButton}>
            <AccountIcon />
            Inloggen
          </Link>
        </>
      )}
    </div>
  );
}
