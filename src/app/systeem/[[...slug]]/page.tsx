import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getRelatedSystemPages,
  getSystemPage,
  getSystemSource,
  systemPages,
  systemSources,
} from "@/app/data/systeem";

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug = [] } = await params;

  if (slug.length === 0) {
    return {
      title: "Het systeem | Meridian",
      description:
        "Ontdek de filosofische, journalistieke en technische basis van Meridian.",
    };
  }

  const page = getSystemPage(slug[0]);

  if (!page) {
    return {
      title: "Systeem | Meridian",
    };
  }

  return {
    title: `${page.title} | Meridian`,
    description: page.summary,
  };
}

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

function SystemOverview() {
  return (
    <main className="mx-auto max-w-[1280px] pb-24 pt-16">
      <section className="border-b border-[#102534]/15 pb-16">
        <p className="mb-6 text-xs uppercase tracking-[0.22em] text-[#9a6748]">
          Meridian / het systeem
        </p>

        <h1 className="max-w-4xl font-serif text-5xl leading-[1.03] tracking-[-0.035em] text-[#102534] md:text-7xl">
          Begrijp niet alleen wat Meridian doet, maar waarom het zo werkt.
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-[#102534]/70">
          Meridian is opgebouwd vanuit één centrale gedachte: niemand ziet
          vanzelf het volledige beeld. Hier vind je de theorie,
          journalistieke methode, informatiearchitectuur, AI en visuele
          principes waarop het platform is gebouwd.
        </p>
      </section>

      <section className="py-16">
        <div className="mb-10 flex items-end justify-between gap-8">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#9a6748]">
              Kennisstructuur
            </p>

            <h2 className="font-serif text-4xl tracking-[-0.025em]">
              Alles hangt samen.
            </h2>
          </div>

          <p className="hidden max-w-sm text-sm leading-6 text-[#102534]/55 md:block">
            Iedere pagina is een ander toegangspunt tot hetzelfde systeem.
            Gedeelde concepten verbinden de onderdelen automatisch.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden border border-[#102534]/10 bg-[#102534]/10 md:grid-cols-2">
          {systemPages.map((page, index) => (
            <Link
              key={page.slug}
              href={`/systeem/${page.slug}`}
              className="group bg-[#fcfaf7] p-8 transition-colors hover:bg-white md:p-10"
            >
              <div className="mb-14 flex items-start justify-between gap-6">
                <span className="text-xs tracking-[0.18em] text-[#102534]/40">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                  <Arrow />
                </span>
              </div>

              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#9a6748]">
                {page.eyebrow}
              </p>

              <h2 className="max-w-lg font-serif text-3xl leading-tight tracking-[-0.02em]">
                {page.title}
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#102534]/65">
                {page.summary}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {page.concepts.slice(0, 4).map((concept) => (
                  <span
                    key={concept}
                    className="rounded-full border border-[#102534]/10 px-3 py-1 text-xs text-[#102534]/55"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[#102534]/15 py-16">
        <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#9a6748]">
              Bronnen
            </p>

            <h2 className="font-serif text-4xl tracking-[-0.025em]">
              Waar dit systeem uit voortkomt.
            </h2>
          </div>

          <div className="divide-y divide-[#102534]/10 border-y border-[#102534]/10">
            {systemSources.map((source) => (
              <div
                key={source.id}
                className="grid gap-3 py-6 md:grid-cols-[180px_1fr]"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[#9a6748]">
                    {source.type}
                  </p>
                </div>

                <div>
                  <h3 className="font-serif text-xl">
                    {source.title}
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#102534]/60">
                    {source.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#102534]/15 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#9a6748]">
            Eén kennislaag
          </p>

          <h2 className="font-serif text-4xl leading-tight tracking-[-0.025em] md:text-5xl">
            De website en de AI hoeven niet twee verschillende versies van
            Meridian te kennen.
          </h2>

          <p className="mt-7 text-base leading-8 text-[#102534]/65">
            Deze pagina&apos;s worden opgebouwd uit dezelfde gestructureerde
            informatie die later ook gebruikt kan worden voor zoeken, een
            knowledge graph, embeddings of RAG. Nieuwe kennis hoeft daardoor
            maar op één plek toegevoegd te worden.
          </p>
        </div>
      </section>
    </main>
  );
}

export default async function SystemPage({
  params,
}: PageProps) {
  const { slug = [] } = await params;

  if (slug.length === 0) {
    return <SystemOverview />;
  }

  if (slug.length !== 1) {
    notFound();
  }

  const page = getSystemPage(slug[0]);

  if (!page) {
    notFound();
  }

  const related = getRelatedSystemPages(page);

  const sources = page.sourceIds
    .map(getSystemSource)
    .filter((source) => source !== undefined);

  return (
    <main className="mx-auto max-w-[1280px] pb-24 pt-10">
      <nav className="mb-16 flex items-center gap-3 text-sm text-[#102534]/50">
        <Link
          href="/systeem"
          className="transition-colors hover:text-[#102534]"
        >
          Het systeem
        </Link>

        <span>→</span>

        <span className="text-[#102534]">{page.title}</span>
      </nav>

      <header className="grid gap-10 border-b border-[#102534]/15 pb-16 md:grid-cols-[1.35fr_0.65fr] md:gap-20">
        <div>
          <p className="mb-5 text-xs uppercase tracking-[0.22em] text-[#9a6748]">
            {page.eyebrow}
          </p>

          <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] tracking-[-0.035em] md:text-7xl">
            {page.title}
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#102534]/70">
            {page.summary}
          </p>
        </div>

        <aside className="self-end">
          <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[#102534]/40">
            Verbonden concepten
          </p>

          <div className="flex flex-wrap gap-2">
            {page.concepts.map((concept) => (
              <span
                key={concept}
                className="rounded-full border border-[#102534]/15 px-3 py-1.5 text-xs"
              >
                {concept}
              </span>
            ))}
          </div>
        </aside>
      </header>

      <article className="py-8">
        {page.sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className="grid gap-8 border-b border-[#102534]/10 py-14 md:grid-cols-[220px_1fr]"
          >
            <div>
              <span className="text-xs tracking-[0.18em] text-[#102534]/35">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="max-w-3xl">
              <h2 className="font-serif text-3xl leading-tight tracking-[-0.02em] md:text-4xl">
                {section.title}
              </h2>

              <div className="mt-7 space-y-5">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-[#102534]/72"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {section.formula && (
                <div className="my-9 border-l-2 border-[#b87145] bg-[#102534]/[0.025] px-6 py-5 font-serif text-lg leading-8">
                  {section.formula}
                </div>
              )}

              {section.points && (
                <ul className="mt-8 space-y-3">
                  {section.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-4 text-sm leading-6 text-[#102534]/70"
                    >
                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#b87145]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </article>

      {related.length > 0 && (
        <section className="py-16">
          <div className="mb-9">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#9a6748]">
              Relaties
            </p>

            <h2 className="font-serif text-4xl tracking-[-0.025em]">
              Dit hangt hiermee samen.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden border border-[#102534]/10 bg-[#102534]/10 md:grid-cols-3">
            {related.map(({ page: relatedPage, sharedConcepts }) => (
              <Link
                key={relatedPage.slug}
                href={`/systeem/${relatedPage.slug}`}
                className="group flex min-h-64 flex-col justify-between bg-[#fcfaf7] p-7 transition-colors hover:bg-white"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9a6748]">
                    {relatedPage.eyebrow}
                  </p>

                  <h3 className="mt-4 font-serif text-2xl leading-tight">
                    {relatedPage.title}
                  </h3>
                </div>

                <div>
                  <p className="mb-5 text-xs text-[#102534]/45">
                    Gedeeld: {sharedConcepts.join(", ")}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span>Verder begrijpen</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <Arrow />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-[#102534]/15 py-14">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#102534]/40">
            Gebaseerd op
          </p>

          <div className="max-w-3xl divide-y divide-[#102534]/10">
            {sources.map((source) => (
              <div
                key={source.id}
                className="grid gap-2 py-5 first:pt-0 md:grid-cols-[160px_1fr]"
              >
                <span className="text-xs uppercase tracking-[0.14em] text-[#9a6748]">
                  {source.type}
                </span>

                <div>
                  <p className="font-serif text-lg">
                    {source.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#102534]/55">
                    {source.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-[#102534]/15 pt-10">
        <Link
          href="/systeem"
          className="inline-flex items-center gap-3 text-sm transition-opacity hover:opacity-60"
        >
          <span>←</span>
          Terug naar het volledige systeem
        </Link>
      </div>
    </main>
  );
}