import Link from "next/link";

import MeridianPerspective from "@/app/components/homepage/MeridianPerspective";
import {
  getRelatedSystemPages,
  getSystemPage,
} from "@/app/data/systeem";

export const metadata = {
  title: "Onze methode | Meridian",
  description:
    "Hoe Meridian ervaringen, perspectieven, bronnen en onderzoek samenbrengt zonder ze door elkaar te halen.",
};

export default function MethodePage() {
  const method = getSystemPage("perspectieven-en-journalistiek");

  if (!method) {
    return null;
  }

  const related = getRelatedSystemPages(method, 3);

  return (
    <main>
      <MeridianPerspective />

      <section
        id="methode"
        className="mx-auto max-w-[1280px] scroll-mt-28 pb-24 pt-20"
      >
        <div className="grid gap-12 border-b border-[#102534]/12 pb-16 md:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#9a6748]">
              Van ervaring naar inzicht
            </p>
            <p className="max-w-sm text-sm leading-7 text-[#102534]/55">
              De methode begint niet bij een conclusie. We proberen eerst
              zichtbaar te maken welke informatie vanuit verschillende
              posities beschikbaar wordt.
            </p>
          </div>

          <div>
            <h2 className="max-w-4xl font-serif text-4xl leading-[1.08] tracking-[-0.03em] md:text-6xl">
              Een perspectief vertelt iets. Geen enkel perspectief vertelt alles.
            </h2>

            <p className="mt-7 max-w-3xl text-base leading-8 text-[#102534]/65">
              {method.summary}
            </p>
          </div>
        </div>

        <div className="border-b border-[#102534]/12">
          {method.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="grid gap-8 border-b border-[#102534]/10 py-14 last:border-b-0 md:grid-cols-[220px_1fr]"
            >
              <div>
                <span className="text-xs tracking-[0.18em] text-[#102534]/32">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="max-w-3xl">
                <h2 className="font-serif text-3xl leading-tight tracking-[-0.025em] md:text-4xl">
                  {section.title}
                </h2>

                <div className="mt-7 space-y-5">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base leading-8 text-[#102534]/68"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.points && (
                  <div className="mt-9 divide-y divide-[#102534]/10 border-y border-[#102534]/10">
                    {section.points.map((point) => (
                      <div
                        key={point}
                        className="grid grid-cols-[24px_1fr] gap-4 py-4"
                      >
                        <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-[#b87145]" />
                        <p className="m-0 text-sm leading-7 text-[#102534]/64">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        <section className="py-16">
          <div className="mb-9 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#9a6748]">
                Verder begrijpen
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.025em]">
                De methode staat in een groter systeem.
              </h2>
            </div>

            <Link
              href="/systeem"
              className="self-start border-b border-[#102534]/40 pb-1 text-sm no-underline"
            >
              Bekijk het volledige systeem →
            </Link>
          </div>

          <div className="grid gap-px overflow-hidden border border-[#102534]/10 bg-[#102534]/10 md:grid-cols-3">
            {related.map(({ page, sharedConcepts }) => (
              <Link
                key={page.slug}
                href={`/systeem/${page.slug}`}
                className="group flex min-h-64 flex-col justify-between bg-[#fcfaf7] p-7 text-inherit no-underline transition-colors hover:bg-white"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9a6748]">
                    {page.eyebrow}
                  </p>
                  <h3 className="mt-4 font-serif text-2xl leading-tight">
                    {page.title}
                  </h3>
                </div>

                <div>
                  <p className="mb-5 text-xs text-[#102534]/43">
                    Gedeeld: {sharedConcepts.join(", ")}
                  </p>
                  <span className="text-sm">Verder begrijpen →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 border-t border-[#102534]/12 pt-14 md:grid-cols-[220px_1fr]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#102534]/38">
            In de praktijk
          </p>

          <div>
            <h2 className="max-w-2xl font-serif text-4xl tracking-[-0.025em]">
              Zie hoe deze methode een echt onderzoek opbouwt.
            </h2>
            <div className="mt-7 flex flex-wrap gap-7 text-sm">
              <Link
                href="/onderzoek/tegenspraak"
                className="border-b border-[#102534]/40 pb-1 no-underline"
              >
                Naar het onderzoek →
              </Link>
              <Link
                href="/artikelen"
                className="border-b border-[#102534]/40 pb-1 no-underline"
              >
                Bekijk artikelen →
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
