import {
  isItemKey,
  type WritingDocument,
  type WritingState,
  type WritingView,
} from "./model";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Ongeldige gegevens.");
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number) {
  if (typeof value !== "string" || value.length > max)
    throw new Error("Tekst is te lang of ontbreekt.");
  return value;
}
function list(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max)
    throw new Error("Deze verzameling is te groot.");
  return value;
}
function key(value: unknown) {
  if (!isItemKey(value)) throw new Error("Ongeldige verwijzing.");
  return value;
}
function itemKeys(value: unknown, max = 2000) {
  return [...new Set(list(value, max).map(key))];
}
function view(value: unknown): WritingView {
  const v = record(value),
    tabs = itemKeys(v.tabs, 50);
  const active = v.active === null ? null : key(v.active),
    reference = v.reference === null ? null : key(v.reference);
  if (active && !tabs.includes(active))
    throw new Error("Het actieve tabblad ontbreekt.");
  if (!["overview", "focus", "reference"].includes(String(v.mode)))
    throw new Error("Onbekende weergave.");
  return {
    tabs,
    active,
    reference,
    mode: v.mode as WritingView["mode"],
    collection: text(v.collection, 100),
    query: text(v.query, 100),
    type: text(v.type, 40),
    status: text(v.status, 40),
    placement: text(v.placement, 30),
  };
}
export function validateWritingState(value: unknown): WritingState {
  const s = record(value);
  const state: WritingState = {
    collections: list(s.collections, 100).map((value) => {
      const c = record(value);
      return {
        id: text(c.id, 100),
        name: text(c.name, 80),
        items: itemKeys(c.items),
      };
    }),
    sessions: list(s.sessions, 100).map((value) => {
      const session = record(value);
      return {
        id: text(session.id, 100),
        name: text(session.name, 80),
        view: view(session.view),
      };
    }),
    links: list(s.links, 5000).map((value) => {
      const pair = list(value, 2);
      if (pair.length !== 2 || pair[0] === pair[1])
        throw new Error("Ongeldig verband.");
      return [key(pair[0]), key(pair[1])];
    }),
    view: view(s.view),
  };
  if (new TextEncoder().encode(JSON.stringify(state)).length > 900000)
    throw new Error("Je werkplek is te groot om in één keer te bewaren.");
  return state;
}
export function validateDocument(
  value: unknown,
): Pick<
  WritingDocument,
  "key" | "title" | "summary" | "revision" | "sections"
> {
  const d = record(value),
    title = text(d.title, 500).trim();
  if (!title) throw new Error("Geef je stuk een titel.");
  const sections = list(d.sections, 500).map((value) => {
    const s = record(value),
      id = text(s.id, 100);
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Ongeldige sectie.");
    return {
      id,
      title: text(s.title, 500),
      body: text(s.body, 200000),
      kind: text(s.kind, 40),
      fresh: s.fresh === true,
    };
  });
  if (new Set(sections.map((s) => s.id)).size !== sections.length)
    throw new Error("Dubbele sectie.");
  const result = {
    key: key(d.key),
    title,
    summary: text(d.summary, 100000),
    revision: text(d.revision, 100),
    sections,
  };
  if (new TextEncoder().encode(JSON.stringify(result)).length > 900000)
    throw new Error("Dit stuk is te groot om in één keer te bewaren.");
  return result;
}
