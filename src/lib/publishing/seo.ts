import type { Metadata } from "next";
import { safeOrigin, plainText, type SharedArticle, type PublicReport } from "./model";
export function articleOrigin(item: SharedArticle | PublicReport) {
  return safeOrigin(item.origin) ?? safeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ?? safeOrigin(process.env.SITE_URL) ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? safeOrigin(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) : null);
}
export function articleMetadata(item: SharedArticle): Metadata {
  const origin = articleOrigin(item), url = origin ? `${origin}/artikelen/${item.slug}` : undefined;
  const title = item.seo.seo_title || plainText(item.title);
  const description = item.seo.description || plainText(item.summary || "").slice(0, 300);
  const canonical = item.canonical_url || url;
  const index = !!origin && item.seo.indexable && process.env.VERCEL_ENV !== "preview";
  return { title, description, alternates: canonical ? { canonical } : undefined, robots: { index, follow: true },
    openGraph: { type: "article", title, description, url, publishedTime: item.published_at, modifiedTime: item.updated_at, images: item.hero_image ? [{ url: item.hero_image, alt: item.image_alt || item.title }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: item.hero_image ? [item.hero_image] : undefined } };
}
export function articleStructuredData(item: SharedArticle) {
  const origin = articleOrigin(item); if (!origin) return null;
  return { "@context": "https://schema.org", "@type": "Article", "@id": `${origin}/artikelen/${item.slug}#article`,
    mainEntityOfPage: `${origin}/artikelen/${item.slug}`, headline: plainText(item.title), description: plainText(item.summary || ""),
    datePublished: item.published_at, dateModified: item.updated_at, inLanguage: "nl", image: item.hero_image || undefined,
    publisher: { "@type": "Organization", name: item.platform === "avera" ? "Amparis" : "Meridian", url: origin },
    isPartOf: item.report ? { "@type": "CreativeWorkSeries", name: item.report.title, url: `${origin}/verslagen/${item.report.slug}` } : undefined };
}
