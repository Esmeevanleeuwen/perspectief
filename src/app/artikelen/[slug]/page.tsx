import Link from "next/link";
import { notFound } from "next/navigation";
import ContentSections from "@/components/content/ContentSections";
import { getPublishedContentBySlug, mediaPath } from "@/lib/admin/content";
import { articles } from "@/app/data/articles";

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };

function numberMeta(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key];
  return typeof value === "number" ? value : 0;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const dbArticle = await getPublishedContentBySlug(slug);

  if (dbArticle && ["article", "analysis", "case"].includes(dbArticle.content_type)) {
    const sections = dbArticle.content_sections ?? [];
    const image = mediaPath(dbArticle.hero_image);
    const experiences = numberMeta(dbArticle.metadata, "experiences");
    const experts = numberMeta(dbArticle.metadata, "experts");

    return (
      <main className="mx-auto max-w-[1280px] pb-24 pt-10">
        <nav className="mb-10 flex flex-wrap items-center gap-2 text-sm text-[#102534]/45" aria-label="Kruimelpad">
          <Link href="/artikelen" className="underline-offset-4 hover:underline">Artikelen</Link>
          <span aria-hidden="true">/</span>
          <span>{dbArticle.content_type}</span>
        </nav>

        <header className="border-b border-[#102534]/15 pb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9a6748]">{dbArticle.eyebrow ?? dbArticle.content_type}</p>
          <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.98] tracking-[-0.045em] md:text-7xl">{dbArticle.title}</h1>
          {dbArticle.subtitle && <p className="mt-5 max-w-3xl font-serif text-2xl leading-9 text-[#102534]/70">{dbArticle.subtitle}</p>}
          {dbArticle.summary && <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">{dbArticle.summary}</p>}
          {(experiences > 0 || experts > 0) && (
            <div className="mt-8 flex flex-wrap gap-5 text-xs uppercase tracking-[0.12em] text-[#102534]/45">
              {experiences > 0 && <span>{experiences} ervaringen</span>}
              {experts > 0 && <span>{experts} deskundigen</span>}
            </div>
          )}
        </header>

        {image && (
          <figure className="my-10 overflow-hidden bg-[#102534]/5">
            <img src={image} alt={dbArticle.image_alt ?? dbArticle.title} className="max-h-[620px] w-full object-cover" />
          </figure>
        )}

        <article className="mx-auto max-w-[760px] py-10">
          {sections.length > 0 ? (
            <ContentSections sections={sections} />
          ) : (
            <p className="text-lg leading-8 text-[#102534]/60">Deze publicatie is aangemaakt, maar de inhoud wordt nog door de redactie opgebouwd.</p>
          )}
        </article>

        <footer className="mx-auto mt-10 flex max-w-[760px] justify-between border-t border-[#102534]/10 pt-8 text-sm">
          <Link href="/artikelen">← Alle artikelen</Link>
          <Link href="/onderzoek">Onderzoeken →</Link>
        </footer>
      </main>
    );
  }

  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-[1280px] pb-24 pt-10">
      <nav className="mb-10 text-sm text-[#102534]/45"><Link href="/artikelen">Artikelen</Link></nav>
      <header className="border-b border-[#102534]/15 pb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9a6748]">{article.label}</p>
        <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.98] tracking-[-0.045em] md:text-7xl">{article.title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">{article.description}</p>
      </header>
      <figure className="my-10 overflow-hidden"><img src={article.image} alt={article.title} className="max-h-[620px] w-full object-cover" /></figure>
      <article className="mx-auto max-w-[760px] py-10">
        {article.content.map((block, index) => block.type === "heading"
          ? <h2 key={index} className="mb-4 mt-10 font-serif text-3xl">{block.text}</h2>
          : <p key={index} className="mb-6 text-[1.02rem] leading-8 text-[#102534]/72">{block.text}</p>
        )}
      </article>
    </main>
  );
}
