import { createContent } from "../../actions";

export default function NewContentPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <h1 className="font-serif text-5xl">Nieuwe publicatie</h1>
      <form action={createContent} className="mt-10 space-y-5">
        <select name="content_type" className="field">
          <option value="article">Artikel</option>
          <option value="analysis">Analyse</option>
          <option value="case">Casus</option>
        </select>
        <input name="title" required placeholder="Titel" className="field" />
        <input name="slug" placeholder="Slug — optioneel" className="field" />
        <textarea name="summary" rows={4} placeholder="Samenvatting" className="field resize-none" />
        <button className="bg-[#102534] px-6 py-3 text-sm text-white">Aanmaken →</button>
      </form>
    </div>
  );
}
