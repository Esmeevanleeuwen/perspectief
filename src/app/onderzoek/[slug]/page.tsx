import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublishedContentBySlug } from "@/lib/admin/content";
import { getResearchBySlug } from "@/app/data/research";
import { getArticlesForResearch } from "@/app/data/articles";

type Props = { params: Promise<{ slug: string }> };

export default async function ResearchPage({ params }: Props) {
  const { slug } = await params;
  const dbResearch = await getPublishedContentBySlug(slug, "research");

  if (dbResearch) {
    const dossier = dbResearch.research_dossiers;
    const supabase = await createClient();

    const { data: children } = await supabase
      .from("research_children")
      .select("relation, content_items!child_content_id(id,slug,title,summary,content_type,status)")
      .eq("research_content_id", dbResearch.id);

    return (
      <main className="mx-auto max-w-[1280px] pb-24 pt-10">
        <nav className="mb-12 text-sm text-[#102534]/45"><Link href="/">Meridian</Link> → Onderzoek</nav>
        <header className="border-b border-[#102534]/15 pb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9a6748]">ONDERZOEK</p>
          <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[1] tracking-[-0.04em] md:text-7xl">{dbResearch.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">{dbResearch.summary}</p>
        </header>

        <section className="grid gap-10 border-b border-[#102534]/10 py-14 md:grid-cols-[0.7fr_1.3fr]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#9a6748]">Centrale vraag</p>
          <div>
            <h2 className="font-serif text-4xl">{dossier?.central_question}</h2>
            {dossier?.method && <p className="mt-5 leading-8 text-[#102534]/60">{dossier.method}</p>}
            {dossier?.boundaries && <p className="mt-5 leading-8 text-[#102534]/45">{dossier.boundaries}</p>}
          </div>
        </section>

        {children?.length ? (
          <section className="py-14">
            <p className="text-xs uppercase tracking-[0.18em] text-[#9a6748]">Uit het onderzoek</p>
            <div className="mt-6 grid gap-px bg-[#102534]/10 md:grid-cols-3">
              {children.map((row: any) => {
                const item = row.content_items;
                if (!item || item.status !== "published") return null;
                return (
                  <Link key={item.id} href={`/artikelen/${item.slug}`} className="bg-[#fcfaf7] p-7 text-inherit no-underline">
                    <span className="text-xs uppercase tracking-[0.12em] text-[#9a6748]">{row.relation}</span>
                    <h3 className="mt-3 font-serif text-2xl">{item.title}</h3>
                    <p className="mt-3 text-sm text-[#102534]/50">{item.summary}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>
    );
  }

  const research = getResearchBySlug(slug);
  if (!research) notFound();

  const relatedArticles = getArticlesForResearch(research.slug);

  return (
    <main className="mx-auto max-w-[1280px] pb-24 pt-10">
      <nav className="mb-12 text-sm text-[#102534]/45"><Link href="/">Meridian</Link> → Onderzoek</nav>
      <header className="border-b border-[#102534]/15 pb-14">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9a6748]">{research.label}</p>
        <h1 className="mt-5 max-w-5xl font-serif text-5xl md:text-7xl">{research.title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">{research.summary}</p>
      </header>

      <section className="py-14">
        <h2 className="font-serif text-4xl">{research.question}</h2>
        <p className="mt-5 max-w-3xl leading-8 text-[#102534]/60">{research.method}</p>
      </section>

      {relatedArticles.length > 0 && (
        <section className="grid gap-px bg-[#102534]/10 md:grid-cols-3">
          {relatedArticles.map((article) => (
            <Link key={article.slug} href={`/artikelen/${article.slug}`} className="bg-[#fcfaf7] p-7 text-inherit no-underline">
              <h3 className="font-serif text-2xl">{article.title}</h3>
              <p className="mt-3 text-sm text-[#102534]/50">{article.description}</p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
