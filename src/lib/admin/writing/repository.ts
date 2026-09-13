import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  collectionKeys,
  emptyWritingState,
  splitKey,
  type ItemKey,
  type WritingDocument,
  type WritingPage,
  type WritingState,
  PAGE_SIZE,
} from "./model";
import { validateWritingState } from "./validation";

export async function readWritingSpace(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("admin_writing_spaces")
    .select("state,version")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Je werkplek kon niet worden geladen.");
  return {
    state: data ? validateWritingState(data.state) : emptyWritingState(),
    version: data?.version ?? 0,
  };
}
export async function readWritingPage(
  client: SupabaseClient,
  state: WritingState,
  page = 1,
): Promise<WritingPage> {
  const { included, excluded } = collectionKeys(state);
  const { data, error } = await client.rpc("admin_list_writing_items", {
    p_query: state.view.query,
    p_type: state.view.type,
    p_status: state.view.status,
    p_placement: state.view.placement,
    p_included: included,
    p_excluded: excluded,
    p_offset: (page - 1) * PAGE_SIZE,
  });
  if (error) throw new Error("Je stukken konden niet worden geladen.");
  const result = data as WritingPage;
  if (page > 1 && !result.items.length && result.total > 0)
    return readWritingPage(client, state, Math.ceil(result.total / PAGE_SIZE));
  return result;
}
type PublicationPayload = {
  item: {
    id: string;
    title: string;
    summary: string | null;
    content_type: string;
    status: string;
    slug: string;
    featured: boolean;
    updated_at: string;
  };
  sections: {
    id: string;
    title: string | null;
    body: string | null;
    section_type: string;
    data: Record<string, unknown>;
  }[];
  revision: string;
  editable: boolean;
};
export function publicationDocument(
  payload: PublicationPayload,
): WritingDocument {
  const { item, sections, revision, editable } = payload;
  return {
    key: `publication:${item.id}`,
    title: item.title,
    summary: item.summary ?? "",
    type: item.content_type,
    status: item.status,
    slug: item.slug,
    featured: item.featured,
    updatedAt: item.updated_at,
    revision,
    editable,
    sections: sections.map((s) => ({
      id: s.id,
      title: s.title ?? "",
      body: s.body ?? "",
      kind: s.section_type,
      data: s.data,
    })),
  };
}
export type NoteRecord = {
  id: string;
  title: string;
  summary: string;
  sections: WritingDocument["sections"];
  version: number;
  updated_at: string;
};
export function noteDocument(note: NoteRecord): WritingDocument {
  return {
    key: `note:${note.id}`,
    title: note.title,
    summary: note.summary,
    type: "note",
    status: "idea",
    slug: null,
    featured: false,
    updatedAt: note.updated_at,
    revision: String(note.version),
    sections: note.sections,
    editable: true,
  };
}
export async function readWritingDocument(
  client: SupabaseClient,
  userId: string,
  key: ItemKey,
): Promise<WritingDocument> {
  const { source, id } = splitKey(key);
  if (source === "publication") {
    const { data, error } = await client.rpc("admin_read_publication", {
      p_id: id,
    });
    if (error || !data)
      throw new Error("Dit stuk is niet beschikbaar of je hebt geen toegang.");
    return publicationDocument(data);
  }
  const { data, error } = await client
    .from("admin_writing_notes")
    .select("id,title,summary,sections,version,updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error || !data) throw new Error("Deze notitie is niet beschikbaar.");
  return noteDocument(data);
}
