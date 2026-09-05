import Link from "next/link";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { absoluteUrl, isPreview, platformName, partnerName, partnerUrl } from "@/lib/dossier-platforms";
import { dossierPath, chapterPath, topicSlug, type DossierSummary, type DossierChapter } from "@/lib/dossier-core";
import { partnerDossiers } from "@/lib/dossier-partner";
import styles from "./DossierUI.module.css";

export { styles };

export function pageMetadata(title: string, description: string, path: string, indexable = true): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: indexable && !isPreview, follow: true },
    openGraph: { title, description, url: absoluteUrl(path), siteName: platformName, type: "website", locale: "nl_NL" },
    twitter: { card: "summary", title, description },
  };
}

export function Shell({ children }: { children: ReactNode }) {
  return <div className={`${styles.shell} ${platformName === "Ampara" ? styles.ampara : ""}`}>{children}</div>;
}

export function Breadcrumbs({ items }: { items: { title: string; href: string }[] }) {
  const crumbs = [{ title: platformName, href: "/" }, ...items];
  return (
    <nav className={styles.breadcrumb} aria-label="Broodkruimelpad">
      {crumbs.map((item, index) => (
        <span key={`${item.href}-${index}`}>
          {index > 0 ? " / " : ""}
          <Link href={item.href} aria-current={index === crumbs.length - 1 ? "page" : undefined}>{item.title}</Link>
        </span>
      ))}
    </nav>
  );
}

export function Cards({ items }: { items: DossierSummary[] }) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <Link key={item.slug} href={dossierPath(item.slug)} className={styles.card}>
          <small>{item.status}</small>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <small>{item.themes.join(" · ")}</small><br />
          <span>Lees het dossier {item.title} →</span>
        </Link>
      ))}
    </div>
  );
}

export function Topics({ themes }: { themes: string[] }) {
  const topics = [...new Map(themes.map((title) => [topicSlug(title), title])).entries()].filter(([slug]) => slug);
  return <nav className={styles.topics} aria-label="Thema’s in dit dossier">{topics.map(([slug, title]) => <Link href={`/themas/${slug}`} key={slug}>{title}</Link>)}</nav>;
}

export function ChapterNav({ slug, chapters, current }: { slug: string; chapters: DossierChapter[]; current?: string }) {
  return (
    <details className={styles.toc} open>
      <summary>Inhoud van dit dossier</summary>
      <nav aria-label="Dossierhoofdstukken">
        <Link href={dossierPath(slug)}>Overzicht van het dossier</Link>
        {chapters.map((item) => <Link key={item.id} href={chapterPath(slug, item.id)} aria-current={item.id === current ? "page" : undefined}>{item.title}</Link>)}
        <Link href={`${dossierPath(slug)}#bronnen`}>Bronnen en onderbouwing</Link>
      </nav>
    </details>
  );
}

export async function PartnerLinks({ dossier }: { dossier: DossierSummary }) {
  const items = await partnerDossiers(dossier);
  return (
    <section className={styles.section} aria-label={`Verbinding met ${partnerName}`}>
      <p className={styles.eyebrow}>{partnerName} · {platformName === "Meridian" ? "politieke afweging" : "onderzoek en context"}</p>
      <h2>{platformName === "Meridian" ? "Waar onderzoek en keuzes elkaar raken." : "Terug naar het onderzoek."}</h2>
      <p>Meridian en Ampara zijn verbonden platforms met verschillende rollen. Een link is geen bewijs of instemming: onderzoek, ervaringen en politieke keuzes blijven onderscheiden.</p>
      {items.length ? (
        <div className={styles.grid}>{items.map((item) => (
          <a className={styles.card} key={item.slug} href={`${partnerUrl}${dossierPath(item.slug)}`}>
            <small>{item.reason}</small><h3>{item.title}</h3><p>{item.description}</p>
            <span>{platformName === "Meridian" ? "Lees bij Ampara" : "Lees bij Meridian"} →</span>
          </a>
        ))}</div>
      ) : <a href={`${partnerUrl}/dossiers`}>Bekijk de dossierbibliotheek van {partnerName} →</a>}
    </section>
  );
}
