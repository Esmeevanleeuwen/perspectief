import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedContentBySlug } from "@/lib/admin/content";
import { articles } from "@/app/data/articles";

type Props = { params: Promise<{ slug: string }> };

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const dbArticle = await getPublishedContentBySlug(slug);

  if (dbArticle && ["article","analysis","case"].includes(dbArticle.content_type)) {
    const sections = [...(dbArticle.content_sections ?? [])].sort((a, b) => a.position - b.position);

    return (
      <main className="mx-auto max-w-[1280px] pb-24 pt-10">
        <nav className="mb-12 text-sm text-[#102534]/45">
          <Link href="/artikelen">Artikelen</Link> → {dbArticle.content_type}
        </nav>

        <header className="border-b border-[#102534]/15 pb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9a6748]">{dbArticle.content_type}</p>
          <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[1] tracking-[-0.04em] md:text-7xl">
            {dbArticle.title}
          </h1>
          {dbArticle.summary && <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">{dbArticle.summary}</p>}
        </header>

        <article className="mx-auto max-w-3xl py-14">
          {sections.map((section) => {
            if (section.section_type === "heading") {
              return <h2 key={section.id} className="mb-5 mt-12 font-serif text-3xl">{section.title ?? section.body}</h2>;
            }

            if (section.section_type === "stat") {
              return <div key={section.id} className="my-12 border-y border-[#102534]/12 py-10 font-serif text-5xl">{section.body}</div>;
            }

            if (section.section_type === "quote") {
              return <blockquote key={section.id} className="my-10 border-l border-[#9a6748] pl-6 font-serif text-2xl italic">{section.body}</blockquote>;
            }

            if (section.section_type === "void") {
              return <div key={section.id} className="h-48" aria-hidden="true" />;
            }

            return <p key={section.id} className="mb-6 text-base leading-8 text-[#102534]/72">{section.body}</p>;
          })}
        </article>
      </main>
    );
  }

  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-[1280px] pb-24 pt-10">
      <nav className="mb-12 text-sm text-[#102534]/45"><Link href="/artikelen">Artikelen</Link></nav>
      <header className="border-b border-[#102534]/15 pb-14">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9a6748]">{article.label}</p>
        <h1 className="mt-5 max-w-5xl font-serif text-5xl md:text-7xl">{article.title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">{article.description}</p>
      </header>
      <article className="mx-auto max-w-3xl py-14">
        {article.content.map((block, i) =>
          block.type === "heading"
            ? <h2 key={i} className="mb-5 mt-12 font-serif text-3xl">{block.text}</h2>
            : <p key={i} className="mb-6 text-base leading-8 text-[#102534]/72">{block.text}</p>
        )}
      </article>
    </main>
  );
}
