import { cache } from "react";
import { partnerUrl } from "@/lib/dossier-platforms";
import { relatedDossiers, type DossierSummary } from "@/lib/dossier-core";
const catalogue = cache(async (): Promise<DossierSummary[]> => {
    try {
        const response = await fetch(`${partnerUrl}/api/dossier-index`, { cache: "no-store", signal: AbortSignal.timeout(2500) });
        if (!response.ok)
            return [];
        const text = await response.text();
        if (text.length > 1000000)
            return [];
        const data: unknown = JSON.parse(text);
        if (!data || typeof data !== "object" || !("version" in data) || data.version !== 1 || !("items" in data) || !Array.isArray(data.items))
            return [];
        return data.items.slice(0, 1000).flatMap((item: unknown) => {
            if (!item || typeof item !== "object")
                return [];
            const row = item as Record<string, unknown>;
            if (typeof row.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) || typeof row.title !== "string" || typeof row.description !== "string" || !Array.isArray(row.themes))
                return [];
            return [{ slug: row.slug, title: row.title.slice(0, 240), description: row.description.slice(0, 500), themes: row.themes.filter((v): v is string => typeof v === "string").slice(0, 12), status: "Openbaar dossier", indexable: false }];
        });
    }
    catch {
        return [];
    }
});
export async function partnerDossiers(current: DossierSummary) {
    const all = await catalogue();
    const exact = all.find(item => item.slug === current.slug);
    const related = relatedDossiers(current, all, 3).map(item => ({ ...item, reason: `Gedeeld thema: ${item.shared.join(", ")}. Geen vastgestelde oorzaak.` }));
    return exact ? [{ ...exact, reason: "Hetzelfde dossieronderwerp, vanuit een andere platformrol." }, ...related].slice(0, 3) : related;
}
