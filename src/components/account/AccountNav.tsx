"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function AccountNav() {
  const path = usePathname();
  return (
    <nav className="member-nav" aria-label="Mijn Meridian">
      {[
        ["/account", "Overzicht"],
        ["/account/bibliotheek", "Mijn bibliotheek"],
        ["/account/opgeslagen", "Opgeslagen"],
        ["/account/profiel", "Profiel & privacy"],
      ].map(([href, label]) => (
        <Link
          href={href}
          key={href}
          aria-current={
            (href === "/account" ? path === href : path.startsWith(href))
              ? "page"
              : undefined
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
