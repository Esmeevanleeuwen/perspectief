import Link from "next/link";
import { articles } from "@/app/data/articles";

export const metadata = {
  title: "Artikelen | Meridian",
  description:
    "Onderzoeken waarin gebeurtenissen, ervaringen en onderliggende structuren met elkaar worden verbonden.",
};

export default function ArticlesPage() {
  return (
    <main className="mx-auto max-w-[1280px] pb-24 pt-16">
      <section className="border-b border-[#102534]/15 pb-14">
        <p className="mb-5 text-xs uppercase tracking-[0.22em] text-[#9a6748]">
          Meridian / onderzoek
        </p>
        <h1 className="max-w-4xl font-serif text-5xl leading-[1.03] tracking-[-0.035em] md:text-7xl">
          Begin bij een gebeurtenis. Beweeg daarna verder.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">
          Ieder onderzoek is een ingang naar perspectieven, bronnen en de
          onderliggende structuren die binnen het Meridian-systeem met elkaar
          verbonden zijn.
        </p>
      </section>

      <section className="grid gap-px border border-[#102534]/10 bg-[#102534]/10 md:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/artikelen/${article.slug}`}
            className="group flex min-h-[430px] flex-col bg-[#fcfaf7] p-7 text-inherit no-underline transition-colors hover:bg-white md:p-9"
          >
            <div className="aspect-[16/9] overflow-hidden bg-[#102534]/5">
              <img
                src={article.image}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>

            <div className="mt-7 flex flex-1 flex-col">
              <p className="text-xs uppercase tracking-[0.18em] text-[#9a6748]">
                {article.label}
              </p>
              <h2 className="mt-3 max-w-xl font-serif text-3xl leading-tight tracking-[-0.025em]">
                {article.title}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#102534]/60">
                {article.description}
              </p>
              <div className="mt-auto flex items-center justify-between pt-8 text-xs text-[#102534]/50">
                <span>{article.experiences} ervaringen</span>
                <span className="text-base text-[#102534] transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-14 flex flex-col justify-between gap-6 border-t border-[#102534]/10 pt-8 md:flex-row">
        <p className="max-w-2xl text-sm leading-7 text-[#102534]/55">
          De artikelen zijn niet het eindpunt. Vanuit ieder onderwerp kun je
          verder naar de journalistieke methode en de theorie waarop Meridian
          zijn informatie ordent.
        </p>
        <Link
          href="/systeem"
          className="self-start border-b border-[#102534]/40 pb-1 text-sm no-underline"
        >
          Naar het systeem →
        </Link>
      </section>
    </main>
  );
}
