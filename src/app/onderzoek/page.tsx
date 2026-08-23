import Link from "next/link";

import { getPublishedDbResearch } from "@/lib/meridian/content";
import { research as localResearch } from "@/app/data/research";

type ResearchCard = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  label: string;
};

export default async function ResearchOverviewPage() {
  const dbResearch = await getPublishedDbResearch();

  const dbItems: ResearchCard[] = dbResearch.map((item) => ({
    slug: item.slug,
    title: item.title,
    summary: item.summary ?? "",
    image: item.hero_image ?? "/onderzoek-tegenspraak.jpg",
    label: item.eyebrow ?? "ONDERZOEK",
  }));

  const dbSlugs = new Set(dbItems.map((item) => item.slug));

  const localItems: ResearchCard[] = localResearch
    .filter((item) => !dbSlugs.has(item.slug))
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      image: item.image,
      label: item.label,
    }));

  const allResearch = [...dbItems, ...localItems];

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-16">
      <header className="mb-16 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#ad6540]">
          Meridian / Onderzoek
        </p>

        <h1 className="mt-5 font-serif text-5xl leading-[1] tracking-[-0.04em] md:text-7xl">
          Begin bij een gebeurtenis.
          <br />
          Beweeg daarna verder.
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/60">
          Ieder onderzoek is een ingang naar perspectieven, bronnen en de
          onderliggende structuren die binnen het Meridian-systeem met elkaar
          verbonden zijn.
        </p>
      </header>

      {allResearch.length === 0 ? (
        <p className="text-sm text-[#102534]/55">
          Er zijn nog geen onderzoeken gepubliceerd.
        </p>
      ) : (
        <section className="grid gap-8 md:grid-cols-2">
          {allResearch.map((item) => (
            <Link
              key={item.slug}
              href={`/onderzoek/${item.slug}`}
              className="block border border-[#102534]/10 p-6 no-underline"
            >
              <div className="aspect-[16/9] overflow-hidden bg-[#102534]/5">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-6">
                <span className="text-xs uppercase tracking-[0.15em] text-[#ad6540]">
                  {item.label}
                </span>

                <h2 className="mt-3 font-serif text-3xl leading-tight text-[#102534]">
                  {item.title}
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#102534]/60">
                  {item.summary}
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}