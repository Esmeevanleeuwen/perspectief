import Link from "next/link";
import type { ReactNode } from "react";
import { getDossier } from "@/lib/dossier-network";
import { dossierPath } from "@/lib/dossier-core";
import { absoluteUrl } from "@/lib/dossier-platforms";
import { Shell, styles } from "@/components/dossiers/DossierUI";

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Omit<Props, "children">) {
  const { slug } = await params;
  const dossier = await getDossier(slug);
  return dossier ? { alternates: { canonical: absoluteUrl(dossierPath(slug)) } } : {};
}

export default async function ResearchLayout({ children, params }: Props) {
  const { slug } = await params;
  const dossier = await getDossier(slug);

  return (
    <>
      {children}
      {dossier && (
        <aside>
          <Shell>
            <section className={styles.section}>
              <h2>Volg het volledige dossier.</h2>
              <p>De hoofdstukken, bronnen en onderzoeksgrenzen staan samen in één overzicht.</p>
              <Link href={dossierPath(slug)}>Open het dossier {dossier.title} →</Link>
            </section>
          </Shell>
        </aside>
      )}
    </>
  );
}
