import Link from "next/link";
import { articleOrigin } from "@/lib/publishing/seo";
import { jsonLdString, type PublicReport } from "@/lib/publishing/model";
import "./public.css";
export default function ReportView({ report }: { report: PublicReport }) {
  const origin = articleOrigin(report);
  return <main className="pub-article">
    {origin && <script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLdString({ "@context":"https://schema.org", "@type":"CollectionPage", name:report.title, url:`${origin}/verslagen/${report.slug}`, mainEntity:{ "@type":"ItemList", itemListElement:report.chapters.map((c,i) => ({"@type":"ListItem",position:i+1,name:c.title,url:origin+c.href})) } })}} />}
    <nav aria-label="Kruimelpad"><Link href="/">Home</Link> / <Link href="/artikelen">Artikelen</Link></nav>
    <header><p>Verslag · Inhoudsopgave</p><h1>{report.title}</h1></header>
    <ol className="pub-report-list">{report.chapters.map(c => <li key={c.id}><Link href={c.href}><small>Hoofdstuk {c.position}</small>{c.title} →</Link></li>)}</ol>
  </main>;
}
