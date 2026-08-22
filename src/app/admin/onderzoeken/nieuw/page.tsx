import { createResearch } from "../../actions";

export default function NewResearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
      <h1 className="font-serif text-5xl">Nieuw onderzoek</h1>
      <form action={createResearch} className="mt-10 space-y-5">
        <input name="title" required placeholder="Titel" className="field" />
        <textarea name="central_question" rows={3} required placeholder="Centrale vraag" className="field resize-none" />
        <textarea name="summary" rows={4} placeholder="Samenvatting" className="field resize-none" />
        <textarea name="method" rows={5} placeholder="Methode" className="field resize-none" />
        <textarea name="boundaries" rows={5} placeholder="Onderzoeksgrenzen" className="field resize-none" />
        <button className="bg-[#102534] px-6 py-3 text-sm text-white">Onderzoek aanmaken →</button>
      </form>
    </div>
  );
}
