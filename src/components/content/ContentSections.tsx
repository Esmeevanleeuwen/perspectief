import type { ContentSection } from "@/lib/admin/content";

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function Paragraphs({ body }: { body: string | null }) {
  if (!body) return null;
  return (
    <>
      {body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
        <p key={index} className="mt-4 whitespace-pre-line text-[1.02rem] leading-8 text-[#102534]/72">
          {paragraph}
        </p>
      ))}
    </>
  );
}

export default function ContentSections({ sections }: { sections: ContentSection[] }) {
  const sorted = [...sections].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-8">
      {sorted.map((section) => {
        const data = object(section.data);
        const eyebrow = typeof data.eyebrow === "string" ? data.eyebrow : null;
        const points = strings(data.points);

        if (section.section_type === "void") {
          return <div key={section.id} className="h-24 md:h-36" aria-hidden="true" />;
        }

        if (section.section_type === "heading") {
          return (
            <section key={section.id} className="pt-7">
              <h2 className="font-serif text-3xl leading-tight tracking-[-0.025em] md:text-4xl">
                {section.title ?? section.body}
              </h2>
            </section>
          );
        }

        if (section.section_type === "quote") {
          return (
            <blockquote key={section.id} className="my-12 border-l-2 border-[#9a6748] py-2 pl-6 font-serif text-2xl leading-9 text-[#102534] md:text-3xl">
              {section.body}
            </blockquote>
          );
        }

        if (section.section_type === "stat") {
          return (
            <aside key={section.id} className="my-12 border-y border-[#102534]/12 py-9">
              {section.title && <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#9a6748]">{section.title}</p>}
              <p className="font-serif text-4xl leading-tight md:text-5xl">{section.body}</p>
            </aside>
          );
        }

        if (["callout", "timeline", "perspective_cluster", "claim_cluster", "source_list"].includes(section.section_type)) {
          return (
            <section key={section.id} className="my-10 rounded-[2px] border border-[#102534]/10 bg-[#f8f7f4] p-6 md:p-8">
              {eyebrow && <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#9a6748]">{eyebrow}</p>}
              {section.title && <h2 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.02em]">{section.title}</h2>}
              <Paragraphs body={section.body} />
              {points.length > 0 && (
                <ol className="mt-6 space-y-3 border-t border-[#102534]/10 pt-5">
                  {points.map((point, index) => (
                    <li key={point} className="grid grid-cols-[2rem_1fr] gap-3 text-sm leading-6 text-[#102534]/68">
                      <span className="font-mono text-[0.7rem] text-[#9a6748]">{String(index + 1).padStart(2, "0")}</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        }

        return (
          <section key={section.id}>
            {section.title && <h2 className="mb-3 mt-10 font-serif text-3xl leading-tight">{section.title}</h2>}
            <Paragraphs body={section.body} />
          </section>
        );
      })}
    </div>
  );
}
