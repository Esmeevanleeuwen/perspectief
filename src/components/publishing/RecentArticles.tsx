import Link from "next/link";
import { readCatalogAll } from "@/lib/publishing/public";
import { discoveryUrl } from "@/lib/publishing/discovery";
/** Crawlable links independent of manual homepage placement; no invented relations. */
export default async function RecentArticles() {
  const items = (await readCatalogAll("meridian")).filter(item => discoveryUrl(item))
    .sort((a,b) => Date.parse(b.published_at) - Date.parse(a.published_at)).slice(0,5);
  if (!items.length) return null;
  return <section aria-labelledby="recent-articles-heading" className="mx-auto max-w-[1280px] border-t border-[#102534]/15 px-6 py-10">
    <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="recent-articles-heading" className="font-serif text-3xl">Net gepubliceerd</h2><Link href="/artikelen">Alle artikelen →</Link></div>
    <ul className="mt-5 divide-y divide-[#102534]/10">{items.map(item => <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
      <Link href={`/artikelen/${item.slug}`} className="text-base underline-offset-4 hover:underline">{item.title}</Link>
      <time className="text-xs opacity-60" dateTime={item.published_at}>{new Date(item.published_at).toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam" })}</time>
    </li>)}</ul><p className="mt-4 text-xs"><a href="/feed.xml">Volg nieuwe artikelen via RSS</a></p>
  </section>;
}
