import { chapterNeighbours, type PublicReport } from "@/lib/publishing/model";
export default function ChapterNavigation({ report, currentId }: { report: PublicReport | null; currentId: string }) {
  if (!report?.chapters.length) return null;
  const { previous, next } = chapterNeighbours(report, currentId);
  return <nav className="pub-chapter-nav" aria-label="Hoofdstukken van dit verslag">
    <p>Onderdeel van <a href={`/verslagen/${report.slug}`}>{report.title}</a></p>
    <div><span>{previous && <a rel="prev" href={previous.href}>← {previous.title}</a>}</span>
      <a href={`/verslagen/${report.slug}`}>Inhoudsopgave</a>
      <span>{next && <a rel="next" href={next.href}>{next.title} →</a>}</span></div>
  </nav>;
}
