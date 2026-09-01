import { notFound } from "next/navigation";

import { requireEditorialUser } from "@/lib/admin/roles";

import {
  addSection,
  deleteSection,
  publishContent,
  updateContent,
  updateSection,
} from "../../actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ContentEditorPage({ params }: Props) {
  const { id } = await params;

  const { supabase, role } = await requireEditorialUser();

  const [{ data: item }, { data: sections }] = await Promise.all([
    supabase
      .from("content_items")
      .select("*")
      .eq("id", id)
      .single(),

    supabase
      .from("content_sections")
      .select("*")
      .eq("content_id", id)
      .order("position"),
  ]);

  if (!item) {
    notFound();
  }

  const canPublish = ["owner", "admin", "editor"].includes(role);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-[#9a6748]">
            {item.content_type}
          </p>

          <h1 className="mt-2 font-serif text-5xl">
            {item.title}
          </h1>

          <p className="mt-3 text-sm text-[#102534]/50">
            Status: {item.status}
          </p>
        </div>

        {canPublish && item.status !== "published" && (
          <form action={publishContent}>
            <input type="hidden" name="id" value={id} />

            <button className="bg-[#9a6748] px-5 py-3 text-sm text-white">
              Publiceren
            </button>
          </form>
        )}
      </div>

      <section className="mt-10 border-t border-[#102534]/10 pt-8">
        <h2 className="font-serif text-3xl">
          Publicatiegegevens
        </h2>

        <form action={updateContent} className="mt-6 space-y-5">
          <input type="hidden" name="id" value={id} />

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.12em]">
              Titel
            </label>

            <input
              name="title"
              defaultValue={item.title}
              className="field"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.12em]">
              Slug
            </label>

            <input
              name="slug"
              defaultValue={item.slug}
              className="field"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.12em]">
              Samenvatting
            </label>

            <textarea
              name="summary"
              defaultValue={item.summary ?? ""}
              rows={5}
              className="field resize-y"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.12em]">
              Status
            </label>

            <select
              name="status"
              defaultValue={item.status}
              className="field"
            >
              <option value="idea">Idea</option>
              <option value="researching">Researching</option>
              <option value="draft">Draft</option>
              <option value="source_check">Source check</option>
              <option value="editorial_review">Editorial review</option>
              <option value="ready">Ready</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button className="bg-[#102534] px-6 py-3 text-sm text-white">
            Gegevens opslaan
          </button>
        </form>
      </section>

      <section className="mt-14 border-t border-[#102534]/10 pt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-[#9a6748]">
              Artikel
            </p>

            <h2 className="mt-2 font-serif text-4xl">
              Inhoud
            </h2>
          </div>

          <span className="text-xs text-[#102534]/45">
            {sections?.length ?? 0} blokken
          </span>
        </div>

        <div className="mt-8 space-y-6">
          {sections?.map((section, index) => (
            <div
              key={section.id}
              className="border border-[#102534]/10 bg-white p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.12em] text-[#9a6748]">
                  {String(index + 1).padStart(2, "0")} ·{" "}
                  {section.section_type}
                </span>

                <form action={deleteSection}>
                  <input
                    type="hidden"
                    name="section_id"
                    value={section.id}
                  />

                  <input
                    type="hidden"
                    name="content_id"
                    value={id}
                  />

                  <button className="text-xs text-[#102534]/45 underline">
                    Verwijderen
                  </button>
                </form>
              </div>

              <form action={updateSection} className="space-y-4">
                <input
                  type="hidden"
                  name="section_id"
                  value={section.id}
                />

                <input
                  type="hidden"
                  name="content_id"
                  value={id}
                />

                <select
                  name="section_type"
                  defaultValue={section.section_type}
                  className="field"
                >
                  <option value="paragraph">Alinea</option>
                  <option value="heading">Kop</option>
                  <option value="quote">Quote</option>
                  <option value="stat">Statistiek</option>
                  <option value="callout">Callout</option>
                  <option value="graph">Graph</option>
                  <option value="void">Lege ruimte</option>
                </select>

                <input
                  name="title"
                  defaultValue={section.title ?? ""}
                  placeholder="Titel — optioneel"
                  className="field"
                />

                <textarea
                  name="body"
                  defaultValue={section.body ?? ""}
                  rows={section.section_type === "paragraph" ? 18 : 8}
                  placeholder="Inhoud"
                  className="field resize-y font-serif text-lg leading-8"
                />

                <button className="border border-[#102534]/25 px-5 py-2 text-sm">
                  Blok opslaan
                </button>
              </form>
            </div>
          ))}
        </div>

        <form
          action={addSection}
          className="mt-10 space-y-4 border border-dashed border-[#102534]/20 p-6"
        >
          <input
            type="hidden"
            name="content_id"
            value={id}
          />

          <p className="text-xs uppercase tracking-[0.15em] text-[#9a6748]">
            Nieuw onderdeel
          </p>

          <select
            name="section_type"
            className="field"
          >
            <option value="paragraph">Alinea</option>
            <option value="heading">Kop</option>
            <option value="quote">Quote</option>
            <option value="stat">Statistiek</option>
            <option value="callout">Callout</option>
            <option value="graph">Graph</option>
            <option value="void">Lege ruimte</option>
          </select>

          <input
            name="title"
            placeholder="Titel — optioneel"
            className="field"
          />

          <textarea
            name="body"
            rows={12}
            placeholder="Inhoud van dit onderdeel"
            className="field resize-y"
          />

          <button className="border border-[#102534]/25 px-5 py-2 text-sm">
            Blok toevoegen
          </button>
        </form>
      </section>
    </div>
  );
}