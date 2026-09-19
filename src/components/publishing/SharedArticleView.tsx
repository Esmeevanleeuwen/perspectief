import Link from "next/link";
import LinkedText from "./LinkedText";
import ChapterNavigation from "./ChapterNavigation";
import { articleStructuredData } from "@/lib/publishing/seo";
import { jsonLdString, safeHref, type SharedArticle } from "@/lib/publishing/model";
import "./public.css";

export default function SharedArticleView({ article }: { article: SharedArticle }) {
  const jsonld = articleStructuredData(article);
  const image = article.hero_image && safeHref(article.hero_image);
  const text = (value: string | null) => <LinkedText text={value} targets={article.targets} />;
  const paragraphs = (value: string | null) => (value || "").split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i}>{text(p)}</p>);
  return <main className="pub-article">
    {jsonld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonld) }} />}
    <nav aria-label="Kruimelpad"><Link href="/">{article.platform === "avera" ? "Amparis" : "Meridian"}</Link> / <Link href="/artikelen">Artikelen</Link>{article.report && <> / <Link href={`/verslagen/${article.report.slug}`}>{article.report.title}</Link></>}</nav>
    <article>
      <header><p>{article.eyebrow || "Artikel"}</p><h1>{article.title}</h1>
        {article.subtitle && <p className="pub-lead">{article.subtitle}</p>}
        {article.summary && <p className="pub-lead">{article.summary}</p>}
        <small>Gepubliceerd <time dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam" })}</time></small>
      </header>
      {image && <img className="pub-hero" src={image} alt={article.image_alt || ""} />}
      <div className="pub-body">
        {[...article.content_sections].sort((a,b) => a.position-b.position).map(s => {
          const points = Array.isArray(s.data?.points) ? s.data.points.filter((p): p is string => typeof p === "string") : [];
          return <section key={s.id} id={`section-${s.id}`}>
            {s.section_type === "void" ? <div aria-hidden="true" style={{ height: "4rem" }} /> : s.section_type === "heading" ? <h2>{text(s.title || s.body)}</h2> : s.section_type === "quote" ? <blockquote>{text(s.body)}</blockquote> : <>
              {s.title && <h2>{text(s.title)}</h2>}{paragraphs(s.body)}
              {!!points.length && <ol>{points.map((p,i) => <li key={i}>{text(p)}</li>)}</ol>}
            </>}
          </section>;
        })}
      </div>
    </article>
    <ChapterNavigation report={article.report} currentId={article.id} />
    <footer><Link href="/artikelen">← Alle artikelen</Link></footer>
  </main>;
}
