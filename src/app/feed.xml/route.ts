import { readCatalogAll } from "@/lib/publishing/public";
import { articleFeed } from "@/lib/publishing/discovery";
import { absoluteUrl, isPreview } from "@/lib/dossier-platforms";
export const dynamic = "force-dynamic";
export async function GET() {
  if (isPreview) return new Response(null, { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  const origin = new URL(absoluteUrl("/")).origin;
  return new Response(articleFeed(await readCatalogAll("meridian"), origin), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
