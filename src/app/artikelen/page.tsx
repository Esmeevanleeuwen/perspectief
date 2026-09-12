import Link from "next/link";
import { articles as staticArticles } from "@/app/data/articles";
import { getPublishedArticles, mediaPath } from "@/lib/admin/content";

export const revalidate = 300;
export const metadata = {
  title: "Artikelen | Meridian",
  description: "Onderzoeken waarin gebeurtenissen, ervaringen en onderliggende structuren met elkaar worden verbonden.",
};

function numberMeta(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key];
  return typeof value === "number" ? value : 0;
}

export default async function ArticlesPage() {
  const cmsArticles = await getPublishedArticles();
  const known = new Set(cmsArticles.map((item) => item.slug));
  const fallback = staticArticles.filter((item) => !known.has(item.slug)).map((item) => ({
    slug: item.slug,
    title: item.title,
    summary: item.description,
    eyebrow: item.label,
    hero_image: item.image,
    image_alt: item.title,
    metadata: { experiences: item.experiences },
    content_type: "article",
  }));

  const items = [
    ...cmsArticles.map((item) => ({
      slug: item.slug,
      title: item.title,
      summary: item.summary ?? "",
      eyebrow: item.eyebrow ?? item.content_type.toUpperCase(),
      hero_image: mediaPath(item.hero_image),
      image_alt: item.image_alt ?? item.title,
      metadata: item.metadata,
      content_type: item.content_type,
    })),
    ...fallback,
  ];

  return (
    <main className="mx-auto max-w-[1280px] pb-24 pt-16">
      <section className="border-b border-[#102534]/15 pb-14">
        <p className="mb-5 text-xs uppercase tracking-[0.22em] text-[#9a6748]">Meridian / publicaties</p>
        <h1 className="max-w-4xl font-serif text-5xl leading-[1.03] tracking-[-0.035em] md:text-7xl">
          Lees het onderzoek vanuit de gebeurtenis.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">
          Artikelen en analyses vormen leesbare ingangen naar ervaringen, bronnen en de grotere onderzoeken waar ze deel van uitmaken.
        </p>
      </section>

      <section className="grid gap-px border-x border-b border-[#102534]/10 bg-[#102534]/10 md:grid-cols-2">
        {items.map((article) => {
          const image = mediaPath(article.hero_image);
          return (
            <Link
              key={article.slug}
              href={`/artikelen/${article.slug}`}
              className="group flex min-h-[390px] flex-col bg-[#fcfaf7] p-7 text-inherit no-underline transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#9a6748] md:p-9"
            >
              {image ? (
                <div className="aspect-[16/9] overflow-hidden bg-[#102534]/5">
                  <img src={image} alt={article.image_alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-end bg-[#102534] p-6 text-xs uppercase tracking-[0.2em] text-white/55">Meridian</div>
              )}

              <div className="mt-7 flex flex-1 flex-col">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9a6748]">{article.eyebrow}</p>
                <h2 className="mt-3 max-w-xl font-serif text-3xl leading-tight tracking-[-0.025em]">{article.title}</h2>
                {article.summary && <p className="mt-4 max-w-xl text-sm leading-7 text-[#102534]/60">{article.summary}</p>}
                <div className="mt-auto flex items-center justify-between pt-8 text-xs text-[#102534]/50">
                  <span>{numberMeta(article.metadata, "experiences") ? `${numberMeta(article.metadata, "experiences")} ervaringen` : article.content_type}</span>
                  <span className="text-base text-[#102534] transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mt-14 flex flex-col justify-between gap-6 border-t border-[#102534]/10 pt-8 md:flex-row">
        <p className="max-w-2xl text-sm leading-7 text-[#102534]/55">
          Een artikel is geen eindpunt. Open een onderzoek om te zien welke vragen, onderdelen en publicaties met elkaar verbonden zijn.
        </p>
        <Link href="/onderzoek" className="self-start border-b border-[#102534]/40 pb-1 text-sm no-underline">Bekijk onderzoeken →</Link>
      </section>
    </main>
  );
}
