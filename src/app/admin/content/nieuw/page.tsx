import Link from "next/link";
import { createContent } from "../../actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewContentPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const field = "min-h-11 w-full rounded-md border border-[#102534]/14 bg-[var(--paper)] px-3 py-2 text-sm outline-none transition focus:border-[#102534]/45 focus:ring-2 focus:ring-[var(--accent-soft)]";

  return (
    <div className="admin-page admin-create">
      <Link href="/admin/content" className="text-xs text-[var(--muted)] underline-offset-4 hover:underline">← Publicaties</Link>
      <div className="mt-5 border-b border-[#102534]/10 pb-7"><p className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--accent)]">Nieuw</p><h1 className="mt-2 font-serif text-5xl tracking-[-0.04em]">Nieuwe publicatie</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">Maak eerst de basis aan. Daarna kun je de inhoud als losse, herschikbare blokken opbouwen en direct previewen.</p></div>
      {error && <p role="alert" className="mt-5 bg-red-50 p-4 text-sm text-red-900">Aanmaken is niet gelukt. Controleer of de slug al bestaat.</p>}
      <form action={createContent} className="mt-7 grid gap-6 rounded-md border border-[#102534]/10 bg-[var(--paper)] p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-xs font-medium">Type<select name="content_type" className={field}><option value="article">Artikel</option><option value="analysis">Analyse</option><option value="case">Casus</option></select></label>
          <label className="grid gap-2 text-xs font-medium">Label<input name="eyebrow" placeholder="Bijv. ONDERZOEK" className={field} /></label>
        </div>
        <label className="grid gap-2 text-xs font-medium">Titel<input name="title" required placeholder="Titel" className={field} /></label>
        <label className="grid gap-2 text-xs font-medium">Slug <span className="font-normal text-[var(--muted)]">Mag leeg blijven; wordt dan uit de titel gemaakt.</span><input name="slug" placeholder="mijn-publicatie" className={field} /></label>
        <label className="grid gap-2 text-xs font-medium">Ondertitel<input name="subtitle" className={field} /></label>
        <label className="grid gap-2 text-xs font-medium">Samenvatting<textarea name="summary" rows={4} className={`${field} resize-y`} /></label>
        <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-xs font-medium">Afbeelding <span className="font-normal text-[var(--muted)]">Gebruik /bestand.jpg of een volledige https-url.</span><input name="hero_image" placeholder="/artikelsad.jpg" className={field} /></label><label className="grid gap-2 text-xs font-medium">Alt-tekst<input name="image_alt" className={field} /></label></div>
        <div className="flex justify-end border-t border-[#102534]/10 pt-5"><button className="rounded-md bg-[var(--accent)] px-5 py-3 text-xs font-medium text-white">Aanmaken en verder bewerken →</button></div>
      </form>
    </div>
  );
}
