/** Independent properties: kind, workflow status and placement never imply one another. */
export type Publication = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  placement: { featured: boolean; position: string | null };
  updatedAt: string;
  canChangeStatus?: boolean;
};

export const publicationTypes = [
  { value: "article", label: "Artikel" },
  { value: "analysis", label: "Analyse" },
  { value: "case", label: "Casus" },
  { value: "research", label: "Onderzoek" },
] as const;

export const publicationStatuses = [
  { value: "idea", label: "Idee" },
  { value: "researching", label: "In onderzoek" },
  { value: "draft", label: "Concept" },
  { value: "source_check", label: "Broncheck" },
  { value: "editorial_review", label: "Redactiecheck" },
  { value: "ready", label: "Klaar voor publicatie" },
  { value: "published", label: "Gepubliceerd" },
  { value: "archived", label: "Gearchiveerd" },
] as const;

export const publicationPlacements = [
  { value: "featured", label: "Uitgelicht" },
  { value: "unfeatured", label: "Niet uitgelicht" },
] as const;

export type PublicationFilters = {
  q: string;
  type: "" | (typeof publicationTypes)[number]["value"];
  status: "" | (typeof publicationStatuses)[number]["value"];
  placement: "" | (typeof publicationPlacements)[number]["value"];
  page: number;
};

export const PUBLICATIONS_PAGE_SIZE = 25;

export type PublicationsResult =
  | { ok: true; items: Publication[]; total: number; page: number; pageSize: number }
  | { ok: false; message: string };

export function optionLabel(options: readonly { value: string; label: string }[], value: string) {
  return options.find(option => option.value === value)?.label ?? value.replaceAll("_", " ");
}
