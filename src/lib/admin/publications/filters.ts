import { publicationTypes, publicationStatuses, publicationPlacements, type PublicationFilters } from "./model";

export type PublicationSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function option<T extends string>(value: string, options: readonly { value: T }[]): T | "" {
  return options.find(item => item.value === value)?.value ?? "";
}

export function parsePublicationFilters(params: PublicationSearchParams): PublicationFilters {
  const page = Number(first(params.page));
  return {
    q: first(params.q).trim().slice(0, 100),
    type: option(first(params.type), publicationTypes),
    status: option(first(params.status), publicationStatuses),
    placement: option(first(params.placement), publicationPlacements),
    page: Number.isSafeInteger(page) && page > 0 && page <= 1000000 ? page : 1,
  };
}

/** Query state can be reused on another route; the database layer never builds URLs. */
export function publicationSearchParams(filters: PublicationFilters, page = filters.page) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.placement) params.set("placement", filters.placement);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}
