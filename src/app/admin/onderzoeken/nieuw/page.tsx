import Link from "next/link";
import { createResearch } from "../../actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewResearchPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const field = "min-h-11 w-full rounded-sm border border-[#102534]/14 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#102534]/45 focus:ring-2 focus:ring-[#9a6748]/15";

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-12">
      <Link href="/admin/onderzoeken" className="text-xs text-[#102534]/50 underline-offset-4 hover:underline">← Onderzoeken</Link>
      <div className="mt-5 border-b border-[#102534]/10 pb-7"><p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#9a6748]">Nieuw onderzoek</p><h1 className="mt-2 font-serif text-5xl tracking-[-0.04em]">Begin bij de vraag.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#102534]/50">Na het aanmaken bouw je het onderzoek verder op met leesblokken en kun je het als uitgelicht onderzoek op de homepage zetten.</p></div>
      {error && <p role="alert" className="mt-5 bg-red-50 p-4 text-sm text-red-900">Aanmaken is niet gelukt. Controleer of de slug al bestaat.</p>}
      <form action={createResearch} className="mt-7 grid gap-6 rounded-sm border border-[#102534]/10 bg-white p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-xs font-medium">Titel<input name="title" required className={field} /></label><label className="grid gap-2 text-xs font-medium">Label<input name="eyebrow" defaultValue="ONDERZOEK" className={field} /></label></div>
        <label className="grid gap-2 text-xs font-medium">Slug <span className="font-normal text-[#102534]/40">Optioneel; wordt anders uit de titel gemaakt.</span><input name="slug" className={field} /></label>
        <label className="grid gap-2 text-xs font-medium">Centrale vraag<textarea name="central_question" rows={3} required className={`${field} resize-y`} /></label>
        <label className="grid gap-2 text-xs font-medium">Samenvatting<textarea name="summary" rows={4} className={`${field} resize-y`} /></label>
        <label className="grid gap-2 text-xs font-medium">Methode<textarea name="method" rows={5} className={`${field} resize-y`} /></label>
        <label className="grid gap-2 text-xs font-medium">Onderzoeksgrenzen<textarea name="boundaries" rows={5} className={`${field} resize-y`} /></label>
        <label className="grid gap-2 text-xs font-medium">Dimensies <span className="font-normal text-[#102534]/40">Eén per regel</span><textarea name="dimensions" rows={4} className={`${field} resize-y`} /></label>
        <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-xs font-medium">Hero-afbeelding<input name="hero_image" placeholder="/onderzoek.jpg" className={field} /></label><label className="grid gap-2 text-xs font-medium">Alt-tekst<input name="image_alt" className={field} /></label></div>
        <div className="flex justify-end border-t border-[#102534]/10 pt-5"><button className="rounded-sm bg-[#102534] px-5 py-3 text-xs font-medium text-white">Onderzoek aanmaken →</button></div>
      </form>
    </div>
  );
}
