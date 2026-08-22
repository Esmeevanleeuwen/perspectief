import { notFound } from "next/navigation";
import { requireEditorialUser } from "@/lib/admin/roles";
import { addSection, publishContent, updateContent } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function ContentEditorPage({ params }: Props) {
  const { id } = await params;
  const { supabase, role } = await requireEditorialUser();

  const [{ data: item }, { data: sections }] = await Promise.all([
    supabase.from("content_items").select("*").eq("id", id).single(),
    supabase.from("content_sections").select("*").eq("content_id", id).order("position"),
  ]);

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-5xl">{item.title}</h1>
        {["owner","admin","editor"].includes(role) && item.status !== "published" && (
          <form action={publishContent}>
            <input type="hidden" name="id" value={id} />
            <button className="bg-[#9a6748] px-5 py-3 text-sm text-white">Publiceren</button>
          </form>
        )}
      </div>

      <form action={updateContent} className="mt-8 space-y-5">
        <input type="hidden" name="id" value={id} />
        <input name="title" defaultValue={item.title} className="field" />
        <input name="slug" defaultValue={item.slug} className="field" />
        <textarea name="summary" defaultValue={item.summary ?? ""} rows={4} className="field resize-none" />
        <select name="status" defaultValue={item.status} className="field">
          <option value="idea">Idea</option>
          <option value="researching">Researching</option>
          <option value="draft">Draft</option>
          <option value="source_check">Source check</option>
          <option value="editorial_review">Editorial review</option>
          <option value="ready">Ready</option>
          <option value="published">Published</option>
        </select>
        <button className="bg-[#102534] px-6 py-3 text-sm text-white">Opslaan</button>
      </form>

      <section className="mt-14 border-t border-[#102534]/10 pt-10">
        <h2 className="font-serif text-3xl">Opbouw</h2>
        <div className="mt-6 space-y-4">
          {sections?.map((section) => (
            <div key={section.id} className="border border-[#102534]/10 bg-white p-5">
              <span className="text-xs uppercase tracking-[0.12em] text-[#9a6748]">{section.section_type}</span>
              {section.title && <h3 className="mt-2 font-serif text-2xl">{section.title}</h3>}
              {section.body && <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{section.body}</p>}
            </div>
          ))}
        </div>

        <form action={addSection} className="mt-8 space-y-4 border border-dashed border-[#102534]/20 p-6">
          <input type="hidden" name="content_id" value={id} />
          <select name="section_type" className="field">
            <option value="paragraph">Alinea</option>
            <option value="heading">Kop</option>
            <option value="quote">Quote</option>
            <option value="stat">Statistiek</option>
            <option value="callout">Callout</option>
            <option value="graph">Graph</option>
            <option value="void">Lege ruimte</option>
          </select>
          <input name="title" placeholder="Titel — optioneel" className="field" />
          <textarea name="body" rows={5} placeholder="Inhoud" className="field resize-none" />
          <button className="border border-[#102534]/25 px-5 py-2 text-sm">Blok toevoegen</button>
        </form>
      </section>
    </div>
  );
}
