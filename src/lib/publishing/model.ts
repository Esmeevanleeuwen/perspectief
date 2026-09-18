export type Platform = "meridian" | "avera";
export type SiteSettings = {
  selected: boolean; slug: string; seo_title: string; description: string;
  indexable: boolean; canonical: "self" | Platform; featured: boolean; position: "main" | "side";
};
export type Relation = { target: string; kind: "background" | "evidence" | "followup" | "counterpoint" | "related" };
export type PublishingConfig = {
  tags: string[]; relations: Relation[]; sites: Record<Platform, SiteSettings>; hero_image: string; image_alt: string;
};
export type PublicSection = { id: string; content_id: string; section_type: string; position: number; title: string | null; body: string | null; data: Record<string, unknown> | null };
export type LinkTarget = { href: string; title: string; sections: string[] };
export type PublicReport = {
  id: string; title: string; slug: string; origin: string | null; updated_at: string; indexable: boolean;
  chapters: { id: string; title: string; slug: string; href: string; position: number }[];
};
export type SharedArticle = {
  id: string; slug: string; content_type: string; title: string; subtitle: string | null;
  summary: string | null; eyebrow: string | null; hero_image: string | null; image_alt: string | null;
  status: string; featured: boolean; featured_position: "main" | "side" | null;
  published_at: string; updated_at: string; metadata: Record<string, unknown>;
  content_sections: PublicSection[]; revision_id: string; platform: Platform;
  seo: SiteSettings; origin: string | null; canonical_url: string | null;
  targets: Record<string, LinkTarget>; report: PublicReport | null;
};
export type Catalog = { items: SharedArticle[]; total: number; origin: string | null };
export type ReportDraft = { id: string; title: string; slug: string; version: number; chapters: { id: string; title: string }[] };
export type PublishingContext = {
  content_id: string; version: number; config: PublishingConfig; reports: ReportDraft[];
  sites: { id: Platform; label: string; origin: string | null }[]; can_set_origin: boolean;
  editions: { platform: Platform; slug: string; state: "published" | "withdrawn"; published_at: string; updated_at: string; revision_id: string }[];
  backlinks: { id: string; title: string; inline: boolean }[];
};
export type ArticleChoice = { id: string; title: string; content_type: string; sections: { id: string; title: string }[] };
export type Selection = { sectionId: string; start: number; end: number; text: string };
export const relationLabels: Record<Relation["kind"], string> = { background: "Achtergrond", evidence: "Onderbouwing", followup: "Vervolg", counterpoint: "Tegenargument", related: "Gerelateerd" };
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isPlatform(value: unknown): value is Platform { return value === "meridian" || value === "avera"; }
export function safeHref(value: string): string | null {
  if (/^\/(?!\/)[^\s\\]*$/.test(value)) return value;
  try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol) && !u.username && !u.password ? u.href : null; } catch { return null; }
}
export function safeOrigin(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password && !u.search && !u.hash && u.pathname === "/" ? u.origin : null; } catch { return null; }
}
export function chapterNeighbours(report: PublicReport, id: string) {
  const index = report.chapters.findIndex(c => c.id === id);
  return { previous: index > 0 ? report.chapters[index - 1] : null, next: index >= 0 ? report.chapters[index + 1] ?? null : null };
}
/** Stable ID links survive slug changes. Unavailable targets render as text, never a private URL. */
export function resolveContentHref(token: string, targets: Record<string, LinkTarget>): string | null {
  const [id, anchor] = token.replace(/^content:/, "").split("#");
  if (!uuidPattern.test(id)) return null;
  const target = targets[id.toLowerCase()];
  const href = target && safeHref(target.href);
  if (!href) return null;
  const section = anchor?.replace(/^section-/, "");
  return section && uuidPattern.test(section) && target.sections.includes(section.toLowerCase()) ? `${href}#section-${section.toLowerCase()}` : href;
}
export type InlinePart = { text: string; href: string | null };
export function inlineParts(body: string, targets: Record<string, LinkTarget> = {}): InlinePart[] {
  const parts: InlinePart[] = []; const pattern = /\[([^\]\n]+)\]\((content:[a-f\d-]+(?:#section-[a-f\d-]+)?|https?:\/\/[^\s)]+|\/(?!\/)[^\s)]+)\)/gi;
  let offset = 0;
  for (const match of body.matchAll(pattern)) {
    const start = match.index!;
    if (start > offset) parts.push({ text: body.slice(offset, start), href: null });
    parts.push({ text: match[1], href: match[2].startsWith("content:") ? resolveContentHref(match[2], targets) : safeHref(match[2]) });
    offset = start + match[0].length;
  }
  if (offset < body.length) parts.push({ text: body.slice(offset), href: null });
  return parts;
}
export function contentLink(label: string, id: string, sectionId?: string) {
  if (!uuidPattern.test(id) || (sectionId && !uuidPattern.test(sectionId))) throw new Error("Ongeldige verwijzing");
  const cleanLabel = label.replace(/[\[\]\r\n]/g, " ").trim() || "Lees verder";
  return `[${cleanLabel}](content:${id.toLowerCase()}${sectionId ? `#section-${sectionId.toLowerCase()}` : ""})`;
}
export function plainText(body: string) { return inlineParts(body).map(p => p.text).join(""); }
export function jsonLdString(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
