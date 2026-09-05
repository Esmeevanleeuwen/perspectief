import Link from "next/link";
import ParticleHero from "@/app/components/homepage/ParticleHero";
import FeaturedArticles from "@/app/components/homepage/FeaturedArticles";
import { getDossiers } from "@/lib/dossier-network";
import { getTopics } from "@/lib/dossier-core";
import { Shell, Cards, styles, pageMetadata } from "@/components/dossiers/DossierUI";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Meridian — het verhaal achter de gebeurtenis",
  "Onderzoek maatschappelijke vragen via doorlopende dossiers, hoofdstukken, artikelen en bronnen.",
  "/",
);

export default async function Home() {
  const dossiers = await getDossiers();
  const topics = getTopics(dossiers);

  return (
    <main>
      <ParticleHero />
      <section id="ontdek" style={{ scrollMarginTop: 90 }}>
        <Shell>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>Doorlopende dossiers</p>
            <h2 style={{ fontFamily: "var(--font-serif, Georgia), serif", fontSize: "clamp(32px,4vw,52px)", fontWeight: 400, lineHeight: 1.1, margin: "0 0 20px" }}>
              Het nieuws gaat verder. Het onderzoek blijft.
            </h2>
            <p>Begin bij de vraag, volg de hoofdstukken en kijk zelf waarop een verhaal is gebaseerd. Nieuwe artikelen krijgen zo een plek in het grotere verband.</p>
          </header>
          <nav className={styles.topics} aria-label="Verken dossieronderwerpen">
            {topics.map((topic) => <Link key={topic.slug} href={`/themas/${topic.slug}`}>{topic.title}</Link>)}
          </nav>
          <Cards items={dossiers.slice(0, 4)} />
          <nav className={styles.topics} aria-label="Dossierbibliotheek">
            <Link href="/dossiers">Alle dossiers</Link>
            <Link href="/themas">Alle thema’s</Link>
            <Link href="/bronnen">Bronnen en documenten</Link>
          </nav>
        </Shell>
      </section>
      <FeaturedArticles />
    </main>
  );
}
