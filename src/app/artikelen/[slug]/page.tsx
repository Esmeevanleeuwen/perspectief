import Link from "next/link";
import { notFound } from "next/navigation";
import { getDbContentBySlug } from "@/lib/meridian/content";
import DatabaseArticle from "@/app/components/database/DatabaseArticle";
import { articles } from "@/app/data/articles";
import { getSystemRelationsForArticle } from "@/app/data/relations";
import { getResearchBySlug } from "@/app/data/research";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const dbItem = await getDbContentBySlug(slug);

if (
  dbItem &&
  dbItem.status === "published" &&
  ["article", "analysis", "case"].includes(dbItem.content_type)
) {
  return <DatabaseArticle item={dbItem} />;
}
  const article = articles.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  const relatedSystemPages = getSystemRelationsForArticle(article.slug);
  const parentResearch = article.researchSlug
    ? getResearchBySlug(article.researchSlug)
    : undefined;

  return (
    <main className="mx-auto max-w-[1280px] pb-24 pt-10">
      <nav className="mb-14 flex flex-wrap items-center gap-3 text-sm text-[#102534]/45">
        {parentResearch ? (
          <>
            <Link
              href={`/onderzoek/${parentResearch.slug}`}
              className="no-underline hover:text-[#102534]"
            >
              {parentResearch.title}
            </Link>
            <span>→</span>
            <span>{article.label.toLowerCase()}</span>
          </>
        ) : (
          <>
            <Link href="/artikelen" className="no-underline hover:text-[#102534]">
              Artikelen
            </Link>
            <span>→</span>
            <span>{article.label.toLowerCase()}</span>
          </>
        )}
      </nav>

      {parentResearch && (
        <section className="mb-10 flex flex-col justify-between gap-4 border-y border-[#102534]/10 py-5 text-sm md:flex-row md:items-center">
          <div>
            <span className="mr-3 text-xs uppercase tracking-[0.16em] text-[#9a6748]">
              Onderdeel van onderzoek
            </span>
            <strong className="font-medium">{parentResearch.title}</strong>
          </div>

          <Link
            href={`/onderzoek/${parentResearch.slug}`}
            className="self-start border-b border-[#102534]/35 pb-1 no-underline md:self-auto"
          >
            Bekijk het volledige dossier →
          </Link>
        </section>
      )}

      <header className="grid gap-10 border-b border-[#102534]/15 pb-14 md:grid-cols-[1.15fr_0.85fr] md:gap-16">
        <div>
          <p className="mb-5 text-xs uppercase tracking-[0.2em] text-[#9a6748]">
            {article.label}
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] tracking-[-0.035em] md:text-7xl">
            {article.title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/68">
            {article.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#102534]/48">
            {article.experiences > 0 && (
              <span>{article.experiences} ervaringen</span>
            )}
            {article.experts > 0 && <span>{article.experts} deskundigen</span>}
            {article.provinces && <span>{article.provinces} provincies</span>}
            <span>{article.date}</span>
          </div>
        </div>

        <div className="self-end overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </header>

      <div className="grid gap-12 py-14 md:grid-cols-[220px_1fr]">
        <aside>
          <p className="text-xs uppercase tracking-[0.18em] text-[#102534]/38">
            {parentResearch ? "Uit het onderzoek" : "Onderzoek"}
          </p>
        </aside>

        <article className="max-w-3xl">
          {article.content.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={`${block.text}-${index}`}
                  className="mb-5 mt-12 font-serif text-3xl leading-tight tracking-[-0.02em]"
                >
                  {block.text}
                </h2>
              );
            }

            return (
              <p
                key={`${block.text}-${index}`}
                className="mb-6 text-base leading-8 text-[#102534]/72"
              >
                {block.text}
              </p>
            );
          })}
        </article>
      </div>

      {parentResearch && (
        <section className="border-t border-[#102534]/15 py-14">
          <div className="grid gap-7 md:grid-cols-[220px_1fr]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#9a6748]">
              Terug naar het dossier
            </p>

            <div>
              <h2 className="max-w-2xl font-serif text-4xl tracking-[-0.025em]">
                Dit artikel is één verdieping binnen een groter onderzoek.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#102534]/58">
                Bekijk de andere casussen, documenten en perspectieven waarmee
                Meridian dezelfde onderzoeksvraag verder uitwerkt.
              </p>
              <Link
                href={`/onderzoek/${parentResearch.slug}`}
                className="mt-7 inline-block border-b border-[#102534]/40 pb-1 text-sm no-underline"
              >
                {parentResearch.title} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {relatedSystemPages.length > 0 && (
        <section className="border-t border-[#102534]/15 py-14">
          <div className="mb-8 grid gap-4 md:grid-cols-[220px_1fr]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#9a6748]">
              Onderliggende structuur
            </p>
            <div>
              <h2 className="font-serif text-4xl tracking-[-0.025em]">
                Verder het systeem in.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#102534]/58">
                Deze onderdelen van Meridian helpen de mechanismen achter het
                onderwerp verder te onderzoeken.
              </p>
            </div>
          </div>

          <div className="grid gap-px border border-[#102534]/10 bg-[#102534]/10 md:grid-cols-3">
            {relatedSystemPages.map((page) => (
              <Link
                key={page.slug}
                href={`/systeem/${page.slug}`}
                className="group flex min-h-60 flex-col justify-between bg-[#fcfaf7] p-7 text-inherit no-underline transition-colors hover:bg-white"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9a6748]">
                    {page.eyebrow}
                  </p>
                  <h3 className="mt-4 font-serif text-2xl leading-tight">
                    {page.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[#102534]/55">
                    {page.summary}
                  </p>
                </div>
                <span className="mt-8 text-sm transition-transform group-hover:translate-x-1">
                  Verder begrijpen →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
