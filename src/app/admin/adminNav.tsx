"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./admin-shell.module.css";

const items = [
  {
    href: "/admin",
    label: "Overzicht",
    icon: "grid",
  },
  {
    href: "/admin/content",
    label: "Publicaties",
    icon: "document",
  },
  {
    href: "/admin/onderzoeken",
    label: "Onderzoeken",
    icon: "research",
  },
];

function Icon({ type }: { type: string }) {
  if (type === "grid") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" />
        <rect x="14" y="4" width="6" height="6" />
        <rect x="4" y="14" width="6" height="6" />
        <rect x="14" y="14" width="6" height="6" />
      </svg>
    );
  }

  if (type === "research") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="10" r="5.5" />
        <path d="M14.5 14.5L20 20" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3.5H14L18 7.5V20.5H6Z" />
      <path d="M14 3.5V8H18" />
      <path d="M9 12H15" />
      <path d="M9 15H15" />
    </svg>
  );
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? styles.navActive : ""}
          >
            <Icon type={item.icon} />

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}