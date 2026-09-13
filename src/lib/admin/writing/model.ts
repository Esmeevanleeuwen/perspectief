/** Item keys point to one source. Collections and tabs never copy article text. */
export type ItemKey = `publication:${string}` | `note:${string}`;
export type WritingSection = {
  id: string;
  title: string;
  body: string;
  kind: string;
  data?: Record<string, unknown>;
  fresh?: boolean;
};
export type WritingItem = {
  key: ItemKey;
  title: string;
  summary: string;
  type: string;
  status: string;
  featured: boolean;
  updatedAt: string;
};
export type WritingDocument = WritingItem & {
  revision: string;
  slug: string | null;
  sections: WritingSection[];
  editable: boolean;
};
export type Collection = { id: string; name: string; items: ItemKey[] };
export type WritingView = {
  tabs: ItemKey[];
  active: ItemKey | null;
  reference: ItemKey | null;
  mode: "overview" | "focus" | "reference";
  collection: string;
  query: string;
  type: string;
  status: string;
  placement: string;
};
export type WritingSession = { id: string; name: string; view: WritingView };
export type WritingState = {
  collections: Collection[];
  sessions: WritingSession[];
  links: [ItemKey, ItemKey][];
  view: WritingView;
};
export type WritingPage = { items: WritingItem[]; total: number; page: number };
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; message: string; conflict?: boolean };
export const PAGE_SIZE = 25;
export const emptyView = (): WritingView => ({
  tabs: [],
  active: null,
  reference: null,
  mode: "overview",
  collection: "all",
  query: "",
  type: "",
  status: "",
  placement: "",
});
export const emptyWritingState = (): WritingState => ({
  collections: [],
  sessions: [],
  links: [],
  view: emptyView(),
});
export const isItemKey = (value: unknown): value is ItemKey =>
  typeof value === "string" &&
  /^(publication|note):[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
export function splitKey(key: ItemKey) {
  const [source, id] = key.split(":");
  return { source, id };
}
export function linkedKeys(state: WritingState, key: ItemKey) {
  return state.links
    .filter(([a, b]) => a === key || b === key)
    .map(([a, b]) => (a === key ? b : a));
}
export function collectionKeys(state: WritingState): {
  included: ItemKey[] | null;
  excluded: ItemKey[] | null;
} {
  if (state.view.collection === "all")
    return { included: null, excluded: null };
  if (state.view.collection === "inbox")
    return {
      included: null,
      excluded: [...new Set(state.collections.flatMap((c) => c.items))],
    };
  return {
    included:
      state.collections.find((c) => c.id === state.view.collection)?.items ??
      [],
    excluded: null,
  };
}
export function openItem(view: WritingView, key: ItemKey): WritingView {
  const tabs = view.tabs.includes(key) ? view.tabs : [...view.tabs, key];
  return {
    ...view,
    tabs,
    active: key,
    reference: view.reference === key ? null : view.reference,
    mode: view.reference === key ? "overview" : view.mode,
  };
}
export function closeItem(view: WritingView, key: ItemKey): WritingView {
  const index = view.tabs.indexOf(key),
    tabs = view.tabs.filter((item) => item !== key);
  const active =
    view.active === key
      ? (tabs[Math.min(index, tabs.length - 1)] ?? null)
      : view.active;
  const reference =
    !active || view.reference === active ? null : view.reference;
  return {
    ...view,
    tabs,
    active,
    reference,
    mode: !reference && view.mode === "reference" ? "overview" : view.mode,
  };
}
