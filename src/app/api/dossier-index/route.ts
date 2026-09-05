import { getDossiers } from "@/lib/dossier-network";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = (await getDossiers())
    .filter((dossier) => dossier.indexable)
    .map(({ slug, title, description, themes }) => ({ slug, title, description, themes }));

  return Response.json(
    { version: 1, items },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
