import { plainText, safeHref, safeOrigin, type SharedArticle } from "./model";

/** Inputs must come from released public editions, never an admin draft. */
export function discoveryUrl(item: SharedArticle): string | null {
  const origin = safeOrigin(item.origin);
  if (!origin || item.status !== "published" || !item.seo.indexable) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) return null;
  const url = `${origin}/artikelen/${item.slug}`;
  return !item.canonical_url || item.canonical_url === url ? url : null;
}

export function articleDescription(item: SharedArticle): string {
  // Preserve explicit editorial SEO text. Only the automatic fallback is shortened.
  if (item.seo.description?.trim()) return plainText(item.seo.description).replace(/\s+/g, " ").trim();
  const source = item.summary?.trim() || item.subtitle?.trim()
    || item.content_sections?.find(section => section.body?.trim())?.body || item.title;
  const text = plainText(source).replace(/\s+/g, " ").trim();
  if (text.length <= 180) return text;
  const end = text.lastIndexOf(" ", 177);
  return `${text.slice(0, end > 100 ? end : 177).trimEnd()}…`;
}

export function articleImageUrl(item: SharedArticle): string | null {
  const href = item.hero_image && safeHref(item.hero_image);
  if (!href) return null;
  if (!href.startsWith("/")) return href;
  const origin = safeOrigin(item.origin);
  return origin ? `${origin}${href}` : null;
}

export function xmlText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function validDate(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function articleSitemap(items: SharedArticle[]): string {
  const eligible = items.filter(item => discoveryUrl(item));
  if (eligible.length > 50000) throw new Error("Splits de artikelsitemap voordat deze meer dan 50.000 URL's bevat.");
  const entries = eligible.map(item => {
    const image = articleImageUrl(item);
    return `<url><loc>${xmlText(discoveryUrl(item)!)}</loc>${validDate(item.updated_at) ? `<lastmod>${xmlText(item.updated_at)}</lastmod>` : ""}${image ? `<image:image><image:loc>${xmlText(image)}</image:loc></image:image>` : ""}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join("\n")}</urlset>`;
}

export function articleFeed(items: SharedArticle[], origin: string): string {
  const publicItems = items.filter(item => discoveryUrl(item)?.startsWith(`${origin}/`))
    .sort((a,b) => (Date.parse(b.updated_at) || 0) - (Date.parse(a.updated_at) || 0)).slice(0,50);
  const modified = publicItems[0]?.updated_at;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>Meridian — nieuwe artikelen</title><link>${xmlText(origin)}/artikelen</link>
<description>Nieuwe en bijgewerkte artikelen van Meridian.</description><language>nl-NL</language>
<atom:link href="${xmlText(origin)}/feed.xml" rel="self" type="application/rss+xml"/>
${modified && validDate(modified) ? `<lastBuildDate>${new Date(modified).toUTCString()}</lastBuildDate>` : ""}
${publicItems.map(item => `<item><title>${xmlText(plainText(item.title))}</title>
<link>${xmlText(discoveryUrl(item)!)}</link><guid isPermaLink="false">urn:uuid:${xmlText(item.id)}</guid>
<description>${xmlText(articleDescription(item))}</description>
${validDate(item.published_at) ? `<pubDate>${new Date(item.published_at).toUTCString()}</pubDate>` : ""}
${validDate(item.updated_at) ? `<atom:updated>${xmlText(item.updated_at)}</atom:updated>` : ""}</item>`).join("\n")}
</channel></rss>`;
}
