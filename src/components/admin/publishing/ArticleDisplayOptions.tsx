"use client";
import type { PublishingConfig, PublishingContext } from "@/lib/publishing/model";

type DisplaySettings = { show_chapters?: boolean };
export default function ArticleDisplayOptions({ config, sites, onChange }: {
  config: PublishingConfig;
  sites: PublishingContext["sites"];
  onChange: (config: PublishingConfig) => void;
}) {
  return <section className="article-display-options">
    <h3>Weergave voor lezers</h3>
    {sites.map(site => <label key={site.id}>Weergave op {site.label}
      <select value={(config.sites[site.id] as DisplaySettings).show_chapters === false ? "normal" : "chapters"}
        onChange={event => onChange({ ...config, sites: { ...config.sites,
          [site.id]: { ...config.sites[site.id], show_chapters: event.target.value === "chapters" },
        } })}>
        <option value="normal">Normaal artikel — zonder hoofdstuknavigatie</option>
        <option value="chapters">Artikel met hoofdstuknavigatie</option>
      </select>
    </label>)}
    <p className="pub-hint">Normaal artikel verbergt de verslagnaam, inhoudsopgave en vorige/volgende-hoofdstuklinks. Je tekst, tussenkoppen en interne hoofdstukindeling blijven bewaard. De keuze wordt zichtbaar zodra je publiceert.</p>
  </section>;
}
