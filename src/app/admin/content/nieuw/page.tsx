import { createContent } from "../../actions";

export default function NewContentPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.16em] text-[#9a6748]">
          Meridian redactie
        </p>

        <h1 className="mt-3 font-serif text-5xl">
          Nieuwe publicatie
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#102534]/60">
          Schrijf hier direct een volledig artikel. Na het aanmaken kun je
          extra blokken, quotes, statistieken en andere onderdelen toevoegen.
        </p>
      </div>

      <form action={createContent} className="mt-10 space-y-6">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em]">
            Type
          </label>

          <select name="content_type" className="field">
            <option value="article">Artikel</option>
            <option value="analysis">Analyse</option>
            <option value="case">Casus</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em]">
            Titel
          </label>

          <input
            name="title"
            required
            placeholder="Titel van het artikel"
            className="field"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em]">
            Slug
          </label>

          <input
            name="slug"
            placeholder="optioneel-wordt-automatisch-gemaakt"
            className="field"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em]">
            Samenvatting
          </label>

          <textarea
            name="summary"
            rows={4}
            placeholder="Korte samenvatting voor kaarten en overzichtspagina's"
            className="field resize-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.12em]">
            Volledig artikel
          </label>

          <textarea
            name="body"
            rows={28}
            placeholder="Schrijf of plak hier het volledige artikel..."
            className="field min-h-[650px] resize-y font-serif text-lg leading-8"
          />
        </div>

        <button className="bg-[#102534] px-7 py-3 text-sm text-white">
          Artikel aanmaken →
        </button>
      </form>
    </div>
  );
}