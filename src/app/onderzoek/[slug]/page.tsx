import Link from "next/link";
import { notFound } from "next/navigation";
import ContentSections from "@/components/content/ContentSections";
import { createClient } from "@/lib/supabase/server";
import { getPublishedContentBySlug, mediaPath, publicContentHref, relationOne } from "@/lib/admin/content";
import { getResearchBySlug } from "@/app/data/research";
import { getArticlesForResearch } from "@/app/data/articles";

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };

type ChildRow = {
  relation: string;
  content_items: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    content_type: string;
    status: string;
  } | null;
};

export default async function ResearchPage({ params }: Props) {
  const { slug } = await params;
  const dbResearch = await getPublishedContentBySlug(slug, "research");

  if (dbResearch) {
    const dossier = relationOne(dbResearch.research_dossiers);
    const sections = dbResearch.content_sections ?? [];
    const image = mediaPath(dbResearch.hero_image);
    const supabase = await createClient();

    const { data: children } = await supabase
      .from("research_children")
      .select("relation, content_items!child_content_id(id,slug,title,summary,content_type,status)")
      .eq("research_content_id", dbResearch.id)
      .order("position", { ascending: true });

    const publishedChildren = ((children ?? []) as unknown as ChildRow[]).filter((row) => row.content_items?.status === "published");

    return (
      <main className="mx-auto max-w-[1280px] pb-24 pt-10">
        <nav className="mb-10 flex flex-wrap items-center gap-2 text-sm text-[#102534]/45" aria-label="Kruimelpad">
          <Link href="/onderzoek">Onderzoeken</Link><span aria-hidden="true">/</span><span>{dbResearch.title}</span>
        </nav>

        <header className="border-b border-[#102534]/15 pb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9a6748]">{dbResearch.eyebrow ?? "ONDERZOEK"}</p>
          <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.98] tracking-[-0.045em] md:text-7xl">{dbResearch.title}</h1>
          {dbResearch.subtitle && <p className="mt-5 max-w-3xl font-serif text-2xl leading-9 text-[#102534]/70">{dbResearch.subtitle}</p>}
          {dbResearch.summary && <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">{dbResearch.summary}</p>}
        </header>

        {image && <figure className="my-10 overflow-hidden bg-[#102534]/5"><img src={image} alt={dbResearch.image_alt ?? dbResearch.title} className="max-h-[620px] w-full object-cover" /></figure>}

        {dossier && (
          <section className="grid gap-8 border-b border-[#102534]/10 py-12 md:grid-cols-[0.68fr_1.32fr] md:gap-14">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#9a6748]">Centrale vraag</p>
              {dossier.dimensions?.length ? <p className="mt-5 text-xs leading-6 text-[#102534]/42">{dossier.dimensions.join(" · ")}</p> : null}
            </div>
            <div>
              <h2 className="font-serif text-4xl leading-tight tracking-[-0.03em]">{dossier.central_question}</h2>
              {dossier.method && <div className="mt-8"><p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#102534]/40">Methode</p><p className="leading-8 text-[#102534]/65">{dossier.method}</p></div>}
              {dossier.boundaries && <div className="mt-6"><p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#102534]/40">Onderzoeksgrens</p><p className="leading-8 text-[#102534]/55">{dossier.boundaries}</p></div>}
            </div>
          </section>
        )}

        {sections.length > 0 && (
          <article className="mx-auto max-w-[780px] py-14">
            <ContentSections sections={sections} />
          </article>
        )}

        {publishedChildren.length > 0 && (
          <section className="border-t border-[#102534]/10 py-14">
            <div className="mb-7 flex items-end justify-between gap-6">
              <div><p className="text-xs uppercase tracking-[0.18em] text-[#9a6748]">Verbonden publicaties</p><h2 className="mt-2 font-serif text-4xl">Lees verder binnen dit onderzoek</h2></div>
            </div>
            <div className="grid gap-px bg-[#102534]/10 md:grid-cols-3">
              {publishedChildren.map((row) => {
                const item = row.content_items!;
                return (
                  <Link key={item.id} href={publicContentHref(item.content_type, item.slug)} className="min-h-56 bg-[#fcfaf7] p-7 text-inherit no-underline transition-colors hover:bg-white">
                    <span className="text-xs uppercase tracking-[0.12em] text-[#9a6748]">{row.relation.replaceAll("_", " ")}</span>
                    <h3 className="mt-3 font-serif text-2xl leading-tight">{item.title}</h3>
                    {item.summary && <p className="mt-3 text-sm leading-6 text-[#102534]/50">{item.summary}</p>}
                    <span className="mt-6 inline-block text-sm">Lees →</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    );
  }

  const research = getResearchBySlug(slug);
  if (!research) notFound();
  const relatedArticles = getArticlesForResearch(research.slug);

  return (
    <main className="mx-auto max-w-[1280px] pb-24 pt-10">
      <nav className="mb-10 text-sm text-[#102534]/45"><Link href="/onderzoek">Onderzoeken</Link></nav>
      <header className="border-b border-[#102534]/15 pb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9a6748]">{research.label}</p>
        <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.98] tracking-[-0.045em] md:text-7xl">{research.title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">{research.summary}</p>
      </header>
      <figure className="my-10 overflow-hidden"><img src={research.image} alt={research.imageAlt} className="max-h-[620px] w-full object-cover" /></figure>
      <section className="grid gap-8 border-b border-[#102534]/10 py-12 md:grid-cols-[0.68fr_1.32fr]">
        <p className="text-xs uppercase tracking-[0.18em] text-[#9a6748]">Centrale vraag</p>
        <div><h2 className="font-serif text-4xl">{research.question}</h2><p className="mt-6 leading-8 text-[#102534]/60">{research.method}</p></div>
      </section>
      <article className="mx-auto max-w-[780px] py-14 space-y-14">
        {research.sections.map((section) => (
          <section key={section.id}>
            {section.eyebrow && <p className="text-xs uppercase tracking-[0.18em] text-[#9a6748]">{section.eyebrow}</p>}
            <h2 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">{section.title}</h2>
            {section.intro && <p className="mt-5 text-lg leading-8 text-[#102534]/70">{section.intro}</p>}
            {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-5 leading-8 text-[#102534]/65">{paragraph}</p>)}
            {section.points?.length ? <ul className="mt-6 space-y-3 border-t border-[#102534]/10 pt-5">{section.points.map((point) => <li key={point} className="text-sm leading-6 text-[#102534]/60">— {point}</li>)}</ul> : null}
          </section>
        ))}
      </article>
      {relatedArticles.length > 0 && <section className="grid gap-px bg-[#102534]/10 md:grid-cols-3">{relatedArticles.map((article) => <Link key={article.slug} href={`/artikelen/${article.slug}`} className="bg-[#fcfaf7] p-7 text-inherit no-underline"><h3 className="font-serif text-2xl">{article.title}</h3><p className="mt-3 text-sm text-[#102534]/50">{article.description}</p></Link>)}</section>}
    </main>
  );
}
