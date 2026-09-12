"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./SiteHeader.module.css";

const navigation = [
  { href: "/dossiers", label: "Dossiers" },
  { href: "/artikelen", label: "Artikelen" },
  { href: "/themas", label: "Thema’s" },
  { href: "/methode", label: "Methode" },
  { href: "/systeem", label: "Het systeem" },
];

export default function SiteHeaderNav({
  account,
  mobileAccount,
}: {
  account: ReactNode;
  mobileAccount: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div
      className={styles.inner}
      ref={root}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("a"))
          setOpen(false);
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setOpen(false);
      }}
    >
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
      <nav className={styles.navigation} aria-label="Hoofdnavigatie">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active(item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className={styles.headerActions}>
        {account}
        <button
          ref={toggle}
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="site-mobile-navigation"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          onClick={() => setOpen((value) => !value)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>
      <div
        id="site-mobile-navigation"
        className={`${styles.mobilePanel} ${open ? styles.mobilePanelOpen : ""}`}
      >
        <div>
          <p className={styles.menuLabel}>Ontdek Meridian</p>
          <nav
            aria-label="Mobiele hoofdnavigatie"
            className={styles.mobileNavigation}
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(item.href) ? "page" : undefined}
              >
                <span>{item.label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
        </div>
        {mobileAccount}
      </div>
    </div>
  );
}
