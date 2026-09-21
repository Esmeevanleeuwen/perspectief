import Link from "next/link";
import ArticleImageField from "@/components/admin/publishing/ArticleImageField";
import { createContent } from "../../actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewContentPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const field = "min-h-11 w-full rounded-md border border-[#102534]/14 bg-[var(--paper)] px-3 py-2 text-sm outline-none transition focus:border-[#102534]/45 focus:ring-2 focus:ring-[var(--accent-soft)]";
  return <div className="admin-page admin-create">
    <Link href="/admin/content" className="text-xs text-[var(--muted)] underline-offset-4 hover:underline">← Publicaties</Link>
    <div className="mt-5 border-b border-[#102534]/10 pb-7">
      <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--accent)]">Nieuw</p>
      <h1 className="mt-2 font-serif text-5xl tracking-[-0.04em]">Nieuw artikel</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">Begin met een titel. Voeg een samenvatting en afbeelding toe en schrijf daarna verder. Het artikel blijft een concept totdat je op Publiceren klikt.</p>
    </div>
    {error && <p role="alert" className="mt-5 bg-red-50 p-4 text-sm text-red-900">Aanmaken is niet gelukt. Controleer of het webadres al bestaat en probeer opnieuw.</p>}
    <form action={createContent} className="mt-7 grid gap-6 rounded-md border border-[#102534]/10 bg-[var(--paper)] p-5 md:p-7">
      <label className="grid gap-2 text-xs font-medium">Titel<input name="title" required maxLength={500} placeholder="Titel van je artikel" className={field} /></label>
      <label className="grid gap-2 text-xs font-medium">Samenvatting <span className="font-normal text-[var(--muted)]">Mag ook later.</span><textarea name="summary" rows={4} className={`${field} resize-y`} /></label>
      <ArticleImageField name="hero_image" />
      <label className="grid gap-2 text-xs font-medium">Beschrijving van de afbeelding<input name="image_alt" maxLength={500} placeholder="Wat is er op de afbeelding te zien?" className={field} /></label>
      <details className="rounded-md border border-[#102534]/10 p-4">
        <summary className="cursor-pointer text-sm">Meer instellingen</summary>
        <div className="mt-5 grid gap-5">
          <label className="grid gap-2 text-xs font-medium">Type<select name="content_type" defaultValue="article" className={field}><option value="article">Artikel</option><option value="analysis">Analyse</option><option value="case">Casus</option></select></label>
          <label className="grid gap-2 text-xs font-medium">Webadres <span className="font-normal text-[var(--muted)]">Wordt automatisch uit de titel gemaakt.</span><input name="slug" placeholder="mijn-artikel" className={field} /></label>
          <label className="grid gap-2 text-xs font-medium">Label<input name="eyebrow" placeholder="Bijvoorbeeld ONDERZOEK" className={field} /></label>
          <label className="grid gap-2 text-xs font-medium">Ondertitel<input name="subtitle" className={field} /></label>
        </div>
      </details>
      <div className="flex justify-end border-t border-[#102534]/10 pt-5"><button className="rounded-md bg-[var(--accent)] px-5 py-3 text-xs font-medium text-white">Concept aanmaken en verder schrijven →</button></div>
    </form>
  </div>;
}
