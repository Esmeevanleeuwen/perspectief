"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./DossierSystemPreview.module.css";

type FeaturedDossier = {
  slug: string;
  title: string;
  description: string;
  status: string;
  pageCount: number;
  themeCount: number;
};

type RelatedDossier = {
  slug: string;
  title: string;
  description: string;
  themes: string[];
};

type Layer = {
  id: string;
  number: string;
  label: string;
  title: string;
  body: string;
  action: string;
};

const layers: Layer[] = [
  {
    id: "gedrag",
    number: "01",
    label: "Gedrag",
    title: "Een gebeurtenis begint buiten het systeem.",
    body: "Gedrag ontstaat in een situatie. De eerste onderzoeksvraag is daarom niet alleen wat er gebeurde, maar ook welke context eraan voorafging.",
    action: "Onderzoek gedrag en context",
  },
  {
    id: "zichtbaarheid",
    number: "02",
    label: "Zichtbaarheid",
    title: "Niet alles wat gebeurt, wordt ook zichtbaar.",
    body: "Wat een systeem ziet, hangt mede af van wat wordt gemeld, geregistreerd en onderzocht. Zichtbaarheid is daarom zelf een onderdeel van het dossier.",
    action: "Onderzoek deze laag",
  },
  {
    id: "classificatie",
    number: "03",
    label: "Classificatie",
    title: "Een gebeurtenis krijgt pas betekenis door beoordeling.",
    body: "Dezelfde gebeurtenis kan via verschillende institutionele routes worden beschreven. Het dossier maakt zichtbaar waar observatie overgaat in een formele classificatie.",
    action: "Bekijk de classificatieroute",
  },
  {
    id: "verwerking",
    number: "04",
    label: "Verwerking",
    title: "Na registratie begint een tweede systeem.",
    body: "Informatie wordt onderzocht, overgedragen en beoordeeld. Capaciteit, beschikbare gegevens en procedures beïnvloeden hoe die route verder loopt.",
    action: "Volg de verwerking",
  },
  {
    id: "gevolgen",
    number: "05",
    label: "Gevolgen",
    title: "Een uitkomst eindigt niet bij één besluit.",
    body: "Gevolgen kunnen terechtkomen bij een persoon, diens juridische positie en de omgeving. Het dossier volgt waar druk en verantwoordelijkheid uiteindelijk landen.",
    action: "Bekijk de gevolgen",
  },
];

function BehaviorDiagram() {
  const dots = Array.from({ length: 24 }, (_, index) => ({
    x: 32 + (index % 6) * 31 + (index % 2) * 4,
    y: 36 + Math.floor(index / 6) * 38 + (index % 3) * 3,
  }));

  return (
    <svg viewBox="0 0 520 260" className={styles.diagram} aria-hidden="true">
      <text x="28" y="22" className={styles.svgLabel}>CONTEXT</text>
      {dots.map((dot, index) => (
        <circle key={index} cx={dot.x} cy={dot.y} r={index === 14 ? 7 : 3.2} className={index === 14 ? styles.svgAccentFill : styles.svgDot} />
      ))}
      <path d="M225 112 C285 112 318 112 368 112" className={styles.svgLine} />
      <circle cx="382" cy="112" r="19" className={styles.svgNode} />
      <circle cx="382" cy="112" r="5" className={styles.svgAccentFill} />
      <text x="350" y="154" className={styles.svgText}>gebeurtenis</text>
      <text x="28" y="232" className={styles.svgCaption}>Veel gedrag. Eén gebeurtenis wordt onderzocht.</text>
    </svg>
  );
}

function VisibilityDiagram() {
  const dots = Array.from({ length: 28 }, (_, index) => ({
    x: 28 + (index % 7) * 22,
    y: 40 + Math.floor(index / 7) * 37 + (index % 2) * 5,
  }));

  return (
    <svg viewBox="0 0 520 260" className={styles.diagram} aria-hidden="true">
      {dots.map((dot, index) => <circle key={index} cx={dot.x} cy={dot.y} r="3" className={index % 4 === 0 ? styles.svgAccentFill : styles.svgDot} />)}
      {[210, 300, 390].map((x, index) => (
        <g key={x}>
          <line x1={x} y1="48" x2={x} y2="194" className={styles.svgGate} />
          <text x={x - 25} y="30" className={styles.svgText}>{["Melding", "Toezicht", "Registratie"][index]}</text>
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <path key={index} d={`M${95 + index * 10} ${62 + index * 23} C220 ${65 + index * 20}, 335 ${82 + index * 16}, 450 124`} className={index < 3 ? styles.svgAccentLine : styles.svgLine} />
      ))}
      <circle cx="455" cy="124" r="6" className={styles.svgAccentFill} />
      <line x1="461" y1="124" x2="500" y2="124" className={styles.svgAccentLine} />
      <text x="410" y="215" className={styles.svgCaption}>systeembeeld</text>
    </svg>
  );
}

function ClassificationDiagram() {
  return (
    <svg viewBox="0 0 520 260" className={styles.diagram} aria-hidden="true">
      <circle cx="92" cy="126" r="28" className={styles.svgNode} />
      <circle cx="92" cy="126" r="6" className={styles.svgAccentFill} />
      <text x="53" y="174" className={styles.svgText}>gebeurtenis</text>
      <path d="M120 126 C175 126 184 60 240 60" className={styles.svgLine} />
      <path d="M120 126 C175 126 184 126 240 126" className={styles.svgAccentLine} />
      <path d="M120 126 C175 126 184 192 240 192" className={styles.svgLine} />
      {[60, 126, 192].map((y, index) => (
        <g key={y}>
          <rect x="240" y={y - 24} width="210" height="48" rx="3" className={index === 1 ? styles.svgAccentBox : styles.svgBox} />
          <text x="260" y={y + 5} className={styles.svgText}>{["conflict / context", "mogelijk strafbaar feit", "zorg- of veiligheidsroute"][index]}</text>
        </g>
      ))}
      <text x="240" y="236" className={styles.svgCaption}>Classificatie bepaalt de volgende route, niet de gebeurtenis alleen.</text>
    </svg>
  );
}

function ProcessingDiagram() {
  const nodes = [
    [68, "Signaal"],
    [184, "Onderzoek"],
    [310, "Beoordeling"],
    [438, "Besluit"],
  ] as const;

  return (
    <svg viewBox="0 0 520 260" className={styles.diagram} aria-hidden="true">
      <line x1="68" y1="124" x2="438" y2="124" className={styles.svgLine} />
      {nodes.map(([x, label], index) => (
        <g key={label}>
          <circle cx={x} cy="124" r={index === 2 ? 15 : 10} className={index === 2 ? styles.svgAccentNode : styles.svgNode} />
          <text x={x - 32} y="168" className={styles.svgText}>{label}</text>
          <text x={x - 9} y="88" className={styles.svgLabel}>0{index + 1}</text>
        </g>
      ))}
      <path d="M184 124 C225 78 265 78 310 124" className={styles.svgAccentLine} />
      <text x="204" y="58" className={styles.svgCaption}>informatie + capaciteit + procedure</text>
    </svg>
  );
}

function ConsequencesDiagram() {
  return (
    <svg viewBox="0 0 520 260" className={styles.diagram} aria-hidden="true">
      <circle cx="100" cy="126" r="22" className={styles.svgAccentNode} />
      <text x="70" y="170" className={styles.svgText}>uitkomst</text>
      {[58, 126, 194].map((y) => <path key={y} d={`M122 126 C190 126 214 ${y} 286 ${y}`} className={y === 126 ? styles.svgAccentLine : styles.svgLine} />)}
      {[
        [286, 58, "persoon"],
        [286, 126, "juridische positie"],
        [286, 194, "omgeving & instituties"],
      ].map(([x, y, label]) => (
        <g key={String(label)}>
          <circle cx={Number(x)} cy={Number(y)} r="9" className={styles.svgNode} />
          <line x1={Number(x) + 9} y1={Number(y)} x2="438" y2={Number(y)} className={styles.svgLine} />
          <text x="322" y={Number(y) - 12} className={styles.svgText}>{label}</text>
        </g>
      ))}
      <text x="286" y="234" className={styles.svgCaption}>Het dossier volgt waar gevolgen en verantwoordelijkheid landen.</text>
    </svg>
  );
}

const diagrams = [
  <BehaviorDiagram key="gedrag" />,
  <VisibilityDiagram key="zichtbaarheid" />,
  <ClassificationDiagram key="classificatie" />,
  <ProcessingDiagram key="verwerking" />,
  <ConsequencesDiagram key="gevolgen" />,
];

export default function DossierSystemPreview({
  featured,
  related,
}: {
  featured: FeaturedDossier;
  related: RelatedDossier[];
}) {
  const [activeIndex, setActiveIndex] = useState(1);
  const active = layers[activeIndex];

  const selectLayer = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section id="ontdek" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.preview}>
          <div className={styles.introColumn}>
            <p className={styles.eyebrow}>Uitgelicht dossier · {featured.status}</p>
            <h2>{featured.title}</h2>
            <p className={styles.intro}>{featured.description}</p>
            <Link className={styles.primaryLink} href={`/dossiers/${featured.slug}`}>
              Bekijk het dossier <span>→</span>
            </Link>

            <dl className={styles.stats}>
              <div><dt>5</dt><dd>systeemlagen</dd></div>
              {featured.pageCount > 0 && <div><dt>{featured.pageCount}</dt><dd>bronpagina&apos;s</dd></div>}
              <div><dt>{featured.themeCount}</dt><dd>verbonden thema&apos;s</dd></div>
            </dl>
          </div>

          <div className={styles.systemColumn}>
            <div className={styles.tabsWrap}>
              <div className={styles.track} aria-hidden="true" />
              <div className={styles.tabs} role="tablist" aria-label="Vijf lagen van Criminaliteit als systeem">
                {layers.map((layer, index) => (
                  <button
                    key={layer.id}
                    type="button"
                    role="tab"
                    aria-selected={activeIndex === index}
                    aria-controls="dossier-layer-panel"
                    tabIndex={activeIndex === index ? 0 : -1}
                    className={`${styles.tab} ${activeIndex === index ? styles.tabActive : ""}`}
                    onClick={() => selectLayer(index)}
                  >
                    <span className={styles.tabNumber}>{layer.number}</span>
                    <span className={styles.tabDot} aria-hidden="true" />
                    <span className={styles.tabLabel}>{layer.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div id="dossier-layer-panel" className={styles.panel} role="tabpanel">
              <div className={styles.panelCopy}>
                <p className={styles.eyebrow}>{active.number} / {active.label}</p>
                <h3>{active.title}</h3>
                <p>{active.body}</p>
                <Link href={`/dossiers/${featured.slug}`} className={styles.layerLink}>
                  {active.action} <span>→</span>
                </Link>
              </div>

              <div className={styles.visual} key={active.id}>
                {diagrams[activeIndex]}
              </div>
            </div>

            <div className={styles.controls}>
              <button type="button" onClick={() => setActiveIndex((activeIndex + layers.length - 1) % layers.length)} aria-label="Vorige systeemlaag">←</button>
              <span>{active.number} / 05</span>
              <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % layers.length)} aria-label="Volgende systeemlaag">→</button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className={styles.more}>
            <div className={styles.moreHeader}>
              <div>
                <p className={styles.eyebrow}>Meer dossiers</p>
                <h2>Andere onderzoeken</h2>
              </div>
              <Link href="/dossiers">Bekijk alle dossiers <span>→</span></Link>
            </div>

            <div className={styles.relatedGrid}>
              {related.slice(0, 3).map((dossier, index) => (
                <Link key={dossier.slug} href={`/dossiers/${dossier.slug}`} className={styles.relatedCard}>
                  <span className={styles.relatedNumber}>{String(index + 2).padStart(2, "0")}</span>
                  <div>
                    <small>{dossier.themes.slice(0, 2).join(" · ") || "Onderzoek"}</small>
                    <h3>{dossier.title}</h3>
                    <p>{dossier.description}</p>
                  </div>
                  <span className={styles.relatedArrow}>→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
