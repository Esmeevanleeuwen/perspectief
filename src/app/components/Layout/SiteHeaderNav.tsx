"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./SiteHeader.module.css";

const navigation = [
  { href: "/dossiers", label: "Dossiers", section: "dossiers" },
  { href: "/artikelen", label: "Artikelen", section: "artikelen" },
  { href: "/themas", label: "Thema’s", section: "themas" },
  { href: "/methode", label: "Methode", section: "methode" },
  { href: "/systeem", label: "Het systeem", section: "systeem" },
];

export default function SiteHeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (section: string) => pathname.startsWith(`/${section}`);

  return (
    <>
      <nav className={styles.navigation} aria-label="Hoofdnavigatie">
        {navigation.map((item) => <Link key={item.href} href={item.href} className={active(item.section) ? styles.active : undefined} aria-current={active(item.section) ? "page" : undefined}>{item.label}</Link>)}
      </nav>
      <button type="button" className={styles.menuButton} aria-expanded={open} aria-controls="site-mobile-navigation" aria-label={open ? "Menu sluiten" : "Menu openen"} onClick={() => setOpen((value) => !value)}><span /><span /></button>
      <nav id="site-mobile-navigation" aria-label="Mobiele hoofdnavigatie" className={`${styles.mobileNavigation} ${open ? styles.mobileNavigationOpen : ""}`}>
        {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active(item.section) ? "page" : undefined}>{item.label}</Link>)}
      </nav>
    </>
  );
}
