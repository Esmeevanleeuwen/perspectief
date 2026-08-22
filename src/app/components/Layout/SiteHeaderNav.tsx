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

export default function SiteHeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const active = (section: string) => {
    if (section === "home") return pathname === "/";
    return pathname.startsWith(`/${section}`);
  };

  return (
    <>
      <nav className={styles.navigation} aria-label="Hoofdnavigatie">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className={active(item.section) ? styles.active : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-label={open ? "Menu sluiten" : "Menu openen"}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>

      <nav className={`${styles.mobileNavigation} ${open ? styles.mobileNavigationOpen : ""}`}>
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
