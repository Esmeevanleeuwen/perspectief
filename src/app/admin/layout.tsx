import Link from "next/link";

import { requireEditorialUser } from "@/lib/admin/roles";

import AdminNav from "./adminNav";
import styles from "./admin-shell.module.css";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { role, user } = await requireEditorialUser();

  const email = user.email ?? "Meridian";
  const initial = email.slice(0, 1).toUpperCase();

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandArea}>
          <Link href="/" className={styles.brand}>
            <svg viewBox="0 0 48 42" aria-hidden="true">
              <path
                d="M6 31V6L24 21L42 6V31"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
              />

              <circle cx="24" cy="35.5" r="3.7" fill="currentColor" />
            </svg>

            <div>
              <strong>MERIDIAN</strong>
              <span>Redactie</span>
            </div>
          </Link>
        </div>

        <div className={styles.sidebarLabel}>
          Werkruimte
        </div>

        <AdminNav />

        <div className={styles.quickActions}>
          <p>Maken</p>

          <Link href="/admin/content/nieuw">
            <span>+</span>
            Nieuwe publicatie
          </Link>

          <Link href="/admin/onderzoeken/nieuw">
            <span>+</span>
            Nieuw onderzoek
          </Link>
        </div>

        <div className={styles.sidebarBottom}>
          <Link href="/" className={styles.siteLink}>
            <span>↗</span>
            Bekijk website
          </Link>

          <div className={styles.user}>
            <div className={styles.avatar}>
              {initial}
            </div>

            <div>
              <strong>{email}</strong>
              <span>{role}</span>
            </div>
          </div>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.topbarLabel}>
              MERIDIAN
            </span>

            <span className={styles.topbarDivider} />

            <span>Redactioneel systeem</span>
          </div>

          <div className={styles.topbarActions}>
            <Link href="/zoeken" className={styles.search}>
              <svg viewBox="0 0 24 24">
                <circle
                  cx="10.5"
                  cy="10.5"
                  r="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M15 15L20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>

              <span>Zoeken</span>
            </Link>

            <div className={styles.topAvatar}>
              {initial}
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </section>
    </main>
  );
}