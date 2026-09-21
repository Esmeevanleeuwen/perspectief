import { readCatalogAll } from "@/lib/publishing/public";
import { articleSitemap } from "@/lib/publishing/discovery";
import { isPreview } from "@/lib/dossier-platforms";
export const dynamic = "force-dynamic";
/** An outage in dossier/source services must not hide article URLs from crawlers. */
export async function GET() {
  if (isPreview) return new Response(null, { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  return new Response(articleSitemap(await readCatalogAll("meridian")), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
