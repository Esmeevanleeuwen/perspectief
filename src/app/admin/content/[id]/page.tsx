import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEditorialUser } from "@/lib/admin/roles";
import { publicContentHref } from "@/lib/admin/content";
import { addSection, deleteContent, deleteSection, moveSection, publishContent, updateContent, updateSection } from "../../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; published?: string }> };

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function metaString(metadata: unknown, key: string) {
  const value = object(metadata)[key];
  return typeof value === "string" ? value : "";
}

function metaNumber(metadata: unknown, key: string) {
  const value = object(metadata)[key];
  return typeof value === "number" ? String(value) : "";
}

function sectionString(data: unknown, key: string) {
  const value = object(data)[key];
  return typeof value === "string" ? value : "";
}

function sectionLines(data: unknown, key: string) {
  const value = object(data)[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : "";
}

const statuses = [
  ["idea", "Idee"], ["researching", "Onderzoek"], ["draft", "Concept"], ["source_check", "Broncheck"],
  ["editorial_review", "Redactiecheck"], ["ready", "Klaar voor publicatie"], ["published", "Gepubliceerd"], ["archived", "Gearchiveerd"],
] as const;

const sectionTypes = [
  ["paragraph", "Alinea"], ["heading", "Kop"], ["intro", "Intro"], ["quote", "Quote"], ["stat", "Statistiek"],
  ["callout", "Kader"], ["timeline", "Stappen / tijdlijn"], ["perspective_cluster", "Perspectief"], ["source_list", "Bronnenblok"], ["claim_cluster", "Claims"], ["void", "Witruimte"],
] as const;

export default async function ContentEditorPage({ params, searchParams }: Props) {
  const { id } = await params;
  const notice = await searchParams;
  const { supabase, role } = await requireEditorialUser();

  const [{ data: item }, { data: sections }, { data: dossier }] = await Promise.all([
    supabase.from("content_items").select("*").eq("id", id).single(),
    supabase.from("content_sections").select("*").eq("content_id", id).order("position", { ascending: true }),
    supabase.from("research_dossiers").select("*").eq("content_id", id).maybeSingle(),
  ]);

  if (!item) notFound();
  const field = "min-h-11 w-full rounded-sm border border-[#102534]/14 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#102534]/45 focus:ring-2 focus:ring-[#9a6748]/15";
  const publicHref = publicContentHref(item.content_type, item.slug);
  const canPublish = ["owner", "admin", "editor"].includes(role);

  return (
    <div className="px-5 py-7 md:px-8 lg:px-10">
      <div className="flex flex-col gap-5 border-b border-[#102534]/10 pb-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <Link href="/admin/content" className="text-xs text-[#102534]/45 underline-offset-4 hover:underline">← Publicaties</Link>
          <div className="mt-4 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#9a6748]/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-[#9a6748]">{item.content_type}</span><span className="rounded-full bg-[#102534]/6 px-3 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-[#102534]/55">{item.status.replaceAll("_", " ")}</span>{item.featured && <span className="rounded-full bg-[#102534] px-3 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-white">Uitgelicht</span>}</div>
          <h1 className="mt-3 max-w-4xl truncate font-serif text-4xl tracking-[-0.035em] md:text-5xl">{item.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.status === "published" && <Link href={publicHref} target="_blank" className="rounded-sm border border-[#102534]/15 bg-white px-4 py-3 text-xs no-underline hover:border-[#102534]/35">Bekijk live ↗</Link>}
          {canPublish && item.status !== "published" && <form action={publishContent}><input type="hidden" name="id" value={id} /><button className="rounded-sm bg-[#9a6748] px-4 py-3 text-xs font-medium text-white">Publiceren</button></form>}
        </div>
      </div>

      {(notice.saved || notice.published) && <p role="status" className="mt-5 rounded-sm border border-emerald-800/15 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice.published ? "Publicatie staat live." : "Wijzigingen opgeslagen."}</p>}

      <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-7">
          <form action={updateContent} className="rounded-sm border border-[#102534]/10 bg-white p-5 md:p-7">
            <input type="hidden" name="id" value={id} />
            <div className="flex items-center justify-between border-b border-[#102534]/10 pb-4"><div><p className="text-[0.65rem] uppercase tracking-[0.17em] text-[#9a6748]">Basis</p><h2 className="mt-1 font-serif text-2xl">Publicatiegegevens</h2></div><button className="rounded-sm bg-[#102534] px-4 py-2.5 text-xs font-medium text-white">Opslaan</button></div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2 text-xs font-medium">Titel<input name="title" required defaultValue={item.title} className={field} /></label>
              <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-xs font-medium">Slug<input name="slug" required defaultValue={item.slug} className={field} /></label><label className="grid gap-2 text-xs font-medium">Label / eyebrow<input name="eyebrow" defaultValue={item.eyebrow ?? ""} className={field} /></label></div>
              <label className="grid gap-2 text-xs font-medium">Ondertitel<input name="subtitle" defaultValue={item.subtitle ?? ""} className={field} /></label>
              <label className="grid gap-2 text-xs font-medium">Samenvatting<textarea name="summary" defaultValue={item.summary ?? ""} rows={4} className={`${field} resize-y`} /></label>
              <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-xs font-medium">Hero-afbeelding <span className="font-normal text-[#102534]/40">/bestand.jpg of volledige https-url</span><input name="hero_image" defaultValue={item.hero_image ?? ""} className={field} /></label><label className="grid gap-2 text-xs font-medium">Alt-tekst<input name="image_alt" defaultValue={item.image_alt ?? ""} className={field} /></label></div>

              {item.content_type === "research" && (
                <fieldset className="mt-2 grid gap-5 border-t border-[#102534]/10 pt-6">
                  <legend className="pr-3 font-serif text-2xl">Onderzoeksstructuur</legend>
                  <label className="grid gap-2 text-xs font-medium">Centrale vraag<textarea name="central_question" defaultValue={dossier?.central_question ?? ""} rows={3} className={`${field} resize-y`} /></label>
                  <label className="grid gap-2 text-xs font-medium">Methode<textarea name="method" defaultValue={dossier?.method ?? ""} rows={4} className={`${field} resize-y`} /></label>
                  <label className="grid gap-2 text-xs font-medium">Onderzoeksgrens<textarea name="boundaries" defaultValue={dossier?.boundaries ?? ""} rows={4} className={`${field} resize-y`} /></label>
                  <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-xs font-medium">Dimensies <span className="font-normal text-[#102534]/40">Eén per regel</span><textarea name="dimensions" defaultValue={(dossier?.dimensions ?? []).join("\n")} rows={5} className={`${field} resize-y`} /></label><label className="grid gap-2 text-xs font-medium">Ontbrekende informatie <span className="font-normal text-[#102534]/40">Eén per regel</span><textarea name="missing_information" defaultValue={(dossier?.missing_information ?? []).join("\n")} rows={5} className={`${field} resize-y`} /></label></div>
                </fieldset>
              )}

              <fieldset className="mt-2 border-t border-[#102534]/10 pt-6"><legend className="pr-3 font-serif text-2xl">Publicatie</legend><div className="mt-4 grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-xs font-medium">Status<select name="status" defaultValue={item.status} className={field}>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="grid gap-2 text-xs font-medium">Datumlabel<input name="display_date" defaultValue={metaString(item.metadata, "display_date")} placeholder="18 juli 2026" className={field} /></label></div>
                <div className="mt-5 grid gap-5 md:grid-cols-3"><label className="grid gap-2 text-xs font-medium">Ervaringen<input name="experiences" type="number" min="0" defaultValue={metaNumber(item.metadata, "experiences")} className={field} /></label><label className="grid gap-2 text-xs font-medium">Deskundigen<input name="experts" type="number" min="0" defaultValue={metaNumber(item.metadata, "experts")} className={field} /></label><label className="grid gap-2 text-xs font-medium">Provincies<input name="provinces" type="number" min="0" defaultValue={metaNumber(item.metadata, "provinces")} className={field} /></label></div>
                <div className="mt-5 flex flex-col gap-4 rounded-sm bg-[#f7f8f8] p-4 sm:flex-row sm:items-center sm:justify-between"><label className="flex items-center gap-3 text-sm"><input type="checkbox" name="featured" defaultChecked={Boolean(item.featured)} className="h-4 w-4 accent-[#102534]" /> Uitlichten op de homepage</label><label className="flex items-center gap-3 text-xs">Positie<select name="featured_position" defaultValue={item.featured_position ?? "side"} className="rounded-sm border border-[#102534]/14 bg-white px-3 py-2"><option value="main">Hoofditem</option><option value="side">Zij-item</option></select></label></div>
              </fieldset>
            </div>
            <div className="mt-7 flex justify-end border-t border-[#102534]/10 pt-5"><button className="rounded-sm bg-[#102534] px-5 py-3 text-xs font-medium text-white">Wijzigingen opslaan</button></div>
          </form>

          <section className="rounded-sm border border-[#102534]/10 bg-white p-5 md:p-7">
            <div className="border-b border-[#102534]/10 pb-4"><p className="text-[0.65rem] uppercase tracking-[0.17em] text-[#9a6748]">Inhoud</p><h2 className="mt-1 font-serif text-3xl">Leesblokken</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#102534]/45">Ieder blok verschijnt op dezelfde volgorde op de publieke pagina. Je kunt ze direct bewerken, verplaatsen of verwijderen.</p></div>
            <div className="mt-6 space-y-4">
              {sections?.map((section, index) => (
                <form action={updateSection} key={section.id} className="rounded-sm border border-[#102534]/10 bg-[#fbfbfa] p-4 md:p-5">
                  <input type="hidden" name="section_id" value={section.id} /><input type="hidden" name="content_id" value={id} />
                  <div className="flex flex-wrap items-center justify-between gap-3"><span className="font-mono text-[0.65rem] text-[#102534]/35">{String(index + 1).padStart(2, "0")}</span><div className="flex flex-wrap gap-1"><button formAction={moveSection} name="direction" value="up" aria-label="Blok omhoog" className="rounded-sm border border-[#102534]/12 bg-white px-2.5 py-1.5 text-xs hover:bg-[#102534]/4">↑</button><button formAction={moveSection} name="direction" value="down" aria-label="Blok omlaag" className="rounded-sm border border-[#102534]/12 bg-white px-2.5 py-1.5 text-xs hover:bg-[#102534]/4">↓</button><button formAction={deleteSection} className="rounded-sm border border-red-900/15 bg-white px-2.5 py-1.5 text-xs text-red-800 hover:bg-red-50">Verwijder</button></div></div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2"><label className="grid gap-1.5 text-[0.68rem] font-medium">Bloktype<select name="section_type" defaultValue={section.section_type} className={field}>{sectionTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="grid gap-1.5 text-[0.68rem] font-medium">Klein label<input name="section_eyebrow" defaultValue={sectionString(section.data, "eyebrow")} className={field} /></label></div>
                  <label className="mt-4 grid gap-1.5 text-[0.68rem] font-medium">Titel<input name="section_title" defaultValue={section.title ?? ""} className={field} /></label>
                  <label className="mt-4 grid gap-1.5 text-[0.68rem] font-medium">Tekst<textarea name="section_body" defaultValue={section.body ?? ""} rows={6} className={`${field} resize-y`} /></label>
                  <label className="mt-4 grid gap-1.5 text-[0.68rem] font-medium">Punten <span className="font-normal text-[#102534]/35">Eén per regel, voor tijdlijn/kader.</span><textarea name="section_points" defaultValue={sectionLines(section.data, "points")} rows={3} className={`${field} resize-y`} /></label>
                  <div className="mt-4 flex justify-end"><button className="rounded-sm border border-[#102534]/16 bg-white px-4 py-2 text-xs font-medium hover:bg-[#102534]/4">Blok opslaan</button></div>
                </form>
              ))}
              {!sections?.length && <p className="rounded-sm border border-dashed border-[#102534]/18 p-6 text-center text-sm text-[#102534]/40">Nog geen leesblokken.</p>}
            </div>

            <form action={addSection} className="mt-6 rounded-sm border border-dashed border-[#102534]/22 p-4 md:p-5"><input type="hidden" name="content_id" value={id} /><div className="flex items-center justify-between"><h3 className="font-serif text-2xl">Nieuw blok</h3><span className="text-xs text-[#102534]/35">Wordt onderaan toegevoegd</span></div><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="grid gap-1.5 text-[0.68rem] font-medium">Type<select name="section_type" className={field}>{sectionTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="grid gap-1.5 text-[0.68rem] font-medium">Klein label<input name="eyebrow" className={field} /></label></div><label className="mt-4 grid gap-1.5 text-[0.68rem] font-medium">Titel<input name="title" className={field} /></label><label className="mt-4 grid gap-1.5 text-[0.68rem] font-medium">Inhoud<textarea name="body" rows={5} className={`${field} resize-y`} /></label><label className="mt-4 grid gap-1.5 text-[0.68rem] font-medium">Punten<textarea name="points" rows={3} className={`${field} resize-y`} /></label><div className="mt-4 flex justify-end"><button className="rounded-sm bg-[#102534] px-4 py-2.5 text-xs font-medium text-white">Blok toevoegen</button></div></form>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-sm border border-[#102534]/10 bg-white p-5"><p className="text-[0.65rem] uppercase tracking-[0.16em] text-[#9a6748]">Preview</p><h2 className="mt-2 font-serif text-2xl">Publieke route</h2><code className="mt-4 block break-all rounded-sm bg-[#f6f7f7] p-3 text-xs text-[#102534]/60">{publicHref}</code><Link href={publicHref} target="_blank" className="mt-4 inline-flex text-xs underline-offset-4 hover:underline">Open preview ↗</Link><p className="mt-4 text-xs leading-5 text-[#102534]/40">Een preview toont alleen content met status ‘Gepubliceerd’. Voor concepten beheer je hier de inhoud totdat je publiceert.</p></section>
          <section className="rounded-sm border border-[#102534]/10 bg-white p-5"><p className="text-[0.65rem] uppercase tracking-[0.16em] text-[#9a6748]">Structuur</p><dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between gap-4"><dt className="text-[#102534]/45">Type</dt><dd>{item.content_type}</dd></div><div className="flex justify-between gap-4"><dt className="text-[#102534]/45">Status</dt><dd>{item.status}</dd></div><div className="flex justify-between gap-4"><dt className="text-[#102534]/45">Blokken</dt><dd>{sections?.length ?? 0}</dd></div><div className="flex justify-between gap-4"><dt className="text-[#102534]/45">Homepage</dt><dd>{item.featured ? item.featured_position : "nee"}</dd></div></dl></section>
          {canPublish && <section className="rounded-sm border border-red-900/12 bg-white p-5"><p className="text-[0.65rem] uppercase tracking-[0.16em] text-red-800">Gevarenzone</p><p className="mt-3 text-xs leading-5 text-[#102534]/45">Verwijderen haalt ook alle gekoppelde leesblokken weg.</p><form action={deleteContent} className="mt-4"><input type="hidden" name="id" value={id} /><button className="rounded-sm border border-red-900/20 px-4 py-2.5 text-xs font-medium text-red-800 hover:bg-red-50">Publicatie verwijderen</button></form></section>}
        </aside>
      </div>
    </div>
  );
}
