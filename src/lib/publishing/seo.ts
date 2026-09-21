import type { Metadata } from "next";
import { safeOrigin, plainText, type SharedArticle, type PublicReport } from "./model";
import { articleDescription, articleImageUrl } from "./discovery";
export function articleOrigin(item: SharedArticle | PublicReport) {
  return safeOrigin(item.origin) ?? safeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ?? safeOrigin(process.env.SITE_URL) ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? safeOrigin(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) : null);
}
export function articleMetadata(item: SharedArticle): Metadata {
  const origin = articleOrigin(item), url = origin ? `${origin}/artikelen/${item.slug}` : undefined;
  const title = item.seo.seo_title || plainText(item.title), description = articleDescription(item);
  const canonical = item.canonical_url || url, image = articleImageUrl(item);
  const index = !!origin && item.seo.indexable && process.env.VERCEL_ENV !== "preview";
  return { title, description, alternates: canonical ? { canonical, ...(item.platform === "meridian" && origin ? { types: { "application/rss+xml": `${origin}/feed.xml` } } : {}) } : undefined,
    robots: { index, follow: true, googleBot: { index, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: { type: "article", locale: "nl_NL", siteName: item.platform === "avera" ? "Amparis" : "Meridian", title, description, url,
      publishedTime: item.published_at, modifiedTime: item.updated_at, images: image ? [{ url: image, alt: item.image_alt || item.title }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined } };
}
export function articleStructuredData(item: SharedArticle) {
  const origin = articleOrigin(item); if (!origin) return null;
  return { "@context": "https://schema.org", "@type": "Article", "@id": `${origin}/artikelen/${item.slug}#article`,
    mainEntityOfPage: `${origin}/artikelen/${item.slug}`, headline: plainText(item.title), description: articleDescription(item),
    datePublished: item.published_at, dateModified: item.updated_at, inLanguage: "nl", image: articleImageUrl(item) || undefined,
    publisher: { "@type": "Organization", name: item.platform === "avera" ? "Amparis" : "Meridian", url: origin },
    isPartOf: item.report ? { "@type": "CreativeWorkSeries", name: item.report.title, url: `${origin}/verslagen/${item.report.slug}` } : undefined };
}
export function articleBreadcrumbData(item: SharedArticle) {
  const origin = articleOrigin(item); if (!origin) return null;
  const items = [{ name: item.platform === "avera" ? "Amparis" : "Meridian", item: `${origin}/` },
    { name: "Artikelen", item: `${origin}/artikelen` },
    ...(item.report ? [{ name: item.report.title, item: `${origin}/verslagen/${item.report.slug}` }] : []),
    { name: plainText(item.title), item: `${origin}/artikelen/${item.slug}` }];
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((item,index) => ({ "@type": "ListItem", position: index+1, ...item })) };
}
