"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import styles from "./SiteHeader.module.css";

const navigation = [
  { href: "/#ontdek", label: "Verken", section: "home" },
  { href: "/artikelen", label: "Artikelen", section: "artikelen" },
  { href: "/methode", label: "Methode", section: "methode" },
  { href: "/systeem", label: "Het systeem", section: "systeem" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(section: string) {
    if (section === "home") return pathname === "/";
    if (section === "artikelen") return pathname.startsWith("/artikelen");
    if (section === "methode") return pathname.startsWith("/methode");
    if (section === "systeem") return pathname.startsWith("/systeem");

    return false;
  }

  return (
    <header className={styles.shell}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Meridian home">
          <svg
            className={styles.logoMark}
            viewBox="0 0 48 42"
            aria-hidden="true"
          >
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

          <span className={styles.brandDivider} />

          <span className={styles.brandName}>MERIDIAN</span>
        </Link>

        <nav className={styles.navigation} aria-label="Hoofdnavigatie">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.section) ? styles.active : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link
            href="/zoeken"
            className={styles.iconButton}
            aria-label="Zoeken"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle
                cx="10.5"
                cy="10.5"
                r="6.3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M15.2 15.2L20.5 20.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Link>

          <span className={styles.actionDivider} />

          <Link href="/login" className={styles.loginButton}>
            Inloggen
          </Link>

          <button
            type="button"
            className={styles.menuButton}
            aria-label={open ? "Menu sluiten" : "Menu openen"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>

        <nav
          className={`${styles.mobileNavigation} ${
            open ? styles.mobileNavigationOpen : ""
          }`}
          aria-label="Mobiele navigatie"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className={styles.mobileUtilities}>
            <Link href="/zoeken" onClick={() => setOpen(false)}>
              Zoeken
            </Link>

            <Link href="/login" onClick={() => setOpen(false)}>
              Inloggen
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}