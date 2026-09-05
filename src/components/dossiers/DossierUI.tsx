import Link from "next/link";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import {
  absoluteUrl,
  isPreview,
  platformName,
  partnerName,
  partnerUrl,
} from "@/lib/dossier-platforms";
import {
  dossierPath,
  chapterPath,
  topicSlug,
  type DossierSummary,
  type DossierChapter,
} from "@/lib/dossier-core";
import { partnerDossiers } from "@/lib/dossier-partner";
import styles from "./DossierUI.module.css";

export { styles };

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  indexable = true,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: indexable && !isPreview, follow: true },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: platformName,
      type: "website",
      locale: "nl_NL",
    },
    twitter: { card: "summary", title, description },
  };
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${styles.shell} ${platformName === "Ampara" ? styles.ampara : ""}`}
    >
      {children}
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { title: string; href: string }[];
}) {
  const crumbs = [{ title: platformName, href: "/" }, ...items];

  return (
    <nav className={styles.breadcrumb} aria-label="Broodkruimelpad">
      <ol>
        {crumbs.map((item, index) => (
          <li key={`${item.href}-${index}`}>
            <Link
              href={item.href}
              aria-current={index === crumbs.length - 1 ? "page" : undefined}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Cards({ items }: { items: DossierSummary[] }) {
  return (
    <div className={`${styles.grid} ${styles.cardGrid}`}>
      {items.map((item, index) => (
        <Link
          key={item.slug}
          href={dossierPath(item.slug)}
          className={styles.card}
        >
          <div className={styles.cardTop}>
            <span className={styles.cardNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <small className={styles.cardStatus}>{item.status}</small>
          </div>

          <h3>{item.title}</h3>
          <p>{item.description}</p>

          <div className={styles.cardFooter}>
            <span className={styles.cardThemes}>
              {item.themes.length ? item.themes.join(" · ") : "Dossier"}
            </span>
            <span className={styles.cardArrow} aria-hidden="true">
              ↗
            </span>
          </div>

          <span className={styles.cardAction}>
            Lees het dossier {item.title}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function Topics({ themes }: { themes: string[] }) {
  const topics = [
    ...new Map(themes.map((title) => [topicSlug(title), title])).entries(),
  ].filter(([slug]) => slug);

  return (
    <nav className={styles.topics} aria-label="Thema’s in dit dossier">
      {topics.map(([slug, title]) => (
        <Link href={`/themas/${slug}`} key={slug}>
          {title}
        </Link>
      ))}
    </nav>
  );
}

export function ChapterNav({
  slug,
  chapters,
  current,
}: {
  slug: string;
  chapters: DossierChapter[];
  current?: string;
}) {
  return (
    <details className={styles.toc} open>
      <summary>Inhoud van dit dossier</summary>
      <nav aria-label="Dossierhoofdstukken">
        <Link href={dossierPath(slug)}>
          <span className={styles.tocIndex}>00</span>
          <span>Overzicht van het dossier</span>
        </Link>

        {chapters.map((item, index) => (
          <Link
            key={item.id}
            href={chapterPath(slug, item.id)}
            aria-current={item.id === current ? "page" : undefined}
          >
            <span className={styles.tocIndex}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{item.title}</span>
          </Link>
        ))}

        <Link href={`${dossierPath(slug)}#bronnen`}>
          <span className={styles.tocIndex}>B</span>
          <span>Bronnen en onderbouwing</span>
        </Link>
      </nav>
    </details>
  );
}

export async function PartnerLinks({
  dossier,
}: {
  dossier: DossierSummary;
}) {
  const items = await partnerDossiers(dossier);
  const isMeridian = platformName === "Meridian";

  return (
    <section
      className={`${styles.section} ${styles.partnerSection}`}
      aria-label={`Verbinding met ${partnerName}`}
    >
      <div className={styles.partnerIntro}>
        <p className={styles.eyebrow}>
          {partnerName} · {isMeridian ? "politieke afweging" : "onderzoek en context"}
        </p>
        <h2>
          {isMeridian
            ? "Waar onderzoek en keuzes elkaar raken."
            : "Terug naar het onderzoek."}
        </h2>
        <p>
          Meridian en Ampara zijn verbonden platforms met verschillende rollen.
          Een link is geen bewijs of instemming: onderzoek, ervaringen en
          politieke keuzes blijven onderscheiden.
        </p>
      </div>

      {items.length ? (
        <div className={styles.grid}>
          {items.map((item) => (
            <a
              className={styles.card}
              key={item.slug}
              href={`${partnerUrl}${dossierPath(item.slug)}`}
            >
              <small>{item.reason}</small>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span>
                {isMeridian ? "Lees bij Ampara" : "Lees bij Meridian"} →
              </span>
            </a>
          ))}
        </div>
      ) : (
        <a className={styles.partnerFallback} href={`${partnerUrl}/dossiers`}>
          Bekijk de dossierbibliotheek van {partnerName} →
        </a>
      )}
    </section>
  );
}
