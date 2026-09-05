import Link from "next/link";
import type { ReactNode } from "react";
import { getArticleDossiers } from "@/lib/dossier-network";
import { Shell, Cards, styles } from "@/components/dossiers/DossierUI";

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function ArticleLayout({ children, params }: Props) {
  const dossiers = await getArticleDossiers((await params).slug);

  return (
    <>
      {children}
      <aside aria-label="Dossiers bij dit artikel">
        <Shell>
          <section className={styles.section}>
            <p className={styles.eyebrow}>Het grotere verhaal</p>
            <h2>{dossiers.length ? "Dit artikel hoort bij een doorlopend dossier." : "Verder kijken dan dit artikel."}</h2>
            {dossiers.length ? <Cards items={dossiers} /> : <p>Er is nog geen expliciete dossierkoppeling voor dit artikel vastgelegd. <Link href="/dossiers">Verken de andere onderzoeksdossiers.</Link></p>}
          </section>
        </Shell>
      </aside>
    </>
  );
}
