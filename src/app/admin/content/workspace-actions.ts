"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireEditorialUser } from "@/lib/admin/roles";
import { publicContentHref } from "@/lib/admin/content";
import {
  PUBLIC_CONTENT_CACHE_TAG,
  DOSSIER_CACHE_TAG,
} from "@/lib/public-cache";
import {
  isItemKey,
  splitKey,
  type Result,
  type WritingDocument,
  type WritingPage,
} from "@/lib/admin/writing/model";
import {
  validateDocument,
  validateWritingState,
} from "@/lib/admin/writing/validation";
import {
  noteDocument,
  publicationDocument,
  readWritingDocument,
  readWritingPage,
} from "@/lib/admin/writing/repository";

const failed = (message: string, conflict = false) => ({
  ok: false as const,
  message,
  conflict,
});

export async function loadWritingPage(
  input: unknown,
  page = 1,
): Promise<Result<WritingPage>> {
  const { supabase } = await requireEditorialUser();
  try {
    if (!Number.isSafeInteger(page) || page < 1 || page > 1000000)
      return failed("Ongeldige pagina.");
    return {
      ok: true,
      value: await readWritingPage(supabase, validateWritingState(input), page),
    };
  } catch {
    return failed("Laden lukte niet. Probeer het opnieuw.");
  }
}
export async function loadWritingDocument(
  key: unknown,
): Promise<Result<WritingDocument>> {
  const { supabase, user } = await requireEditorialUser();
  if (!isItemKey(key)) return failed("Ongeldig stuk.");
  try {
    return {
      ok: true,
      value: await readWritingDocument(supabase, user.id, key),
    };
  } catch {
    return failed("Dit stuk is niet beschikbaar of je hebt geen toegang.");
  }
}
export async function loadWritingTitles(
  keys: unknown,
): Promise<Result<Record<string, string>>> {
  const { supabase, user } = await requireEditorialUser();
  if (!Array.isArray(keys) || keys.length > 200 || !keys.every(isItemKey))
    return failed("Ongeldige selectie.");
  const publicationIds = keys
    .filter((key) => key.startsWith("publication:"))
    .map((key) => splitKey(key).id);
  const noteIds = keys
    .filter((key) => key.startsWith("note:"))
    .map((key) => splitKey(key).id);
  const [publications, notes] = await Promise.all([
    publicationIds.length
      ? supabase
          .from("content_items")
          .select("id,title")
          .in("id", publicationIds)
      : Promise.resolve({ data: [], error: null }),
    noteIds.length
      ? supabase
          .from("admin_writing_notes")
          .select("id,title")
          .in("id", noteIds)
          .eq("user_id", user.id)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (publications.error || notes.error)
    return failed("Titels konden niet worden geladen.");
  return {
    ok: true,
    value: Object.fromEntries([
      ...(publications.data ?? []).map((row) => [
        `publication:${row.id}`,
        row.title,
      ]),
      ...(notes.data ?? []).map((row) => [`note:${row.id}`, row.title]),
    ]),
  };
}
export async function saveWritingSpace(
  input: unknown,
  version: number,
): Promise<Result<{ version: number }>> {
  const { supabase, user } = await requireEditorialUser();
  try {
    const state = validateWritingState(input);
    if (!Number.isSafeInteger(version) || version < 0)
      return failed("Ongeldige versie.");
    const row = {
      user_id: user.id,
      state,
      version: version + 1,
      updated_at: new Date().toISOString(),
    };
    const query =
      version === 0
        ? supabase.from("admin_writing_spaces").insert(row)
        : supabase
            .from("admin_writing_spaces")
            .update(row)
            .eq("user_id", user.id)
            .eq("version", version);
    const { data, error } = await query.select("version").maybeSingle();
    if (error?.code === "23505" || (!error && !data))
      return failed(
        "Deze werkplek is in een ander venster gewijzigd. Herlaad na het opslaan van je teksten.",
        true,
      );
    if (error)
      return failed("Je indeling is nog niet opgeslagen. Probeer opnieuw.");
    return { ok: true, value: { version: data!.version } };
  } catch (error) {
    return failed(
      error instanceof Error
        ? error.message
        : "Je indeling kon niet worden opgeslagen.",
    );
  }
}
export async function createWritingNote(
  title: unknown,
  body: unknown,
): Promise<Result<WritingDocument>> {
  const { supabase, user } = await requireEditorialUser();
  if (
    typeof title !== "string" ||
    typeof body !== "string" ||
    !body.trim() ||
    body.length > 200000 ||
    title.length > 500
  )
    return failed("Vul een notitie in van maximaal 200.000 tekens.");
  const { data, error } = await supabase
    .from("admin_writing_notes")
    .insert({
      user_id: user.id,
      title: title.trim() || body.trim().split("\n")[0].slice(0, 100),
      sections: [
        { id: crypto.randomUUID(), title: "Gedachte", body, kind: "paragraph" },
      ],
    })
    .select("id,title,summary,sections,version,updated_at")
    .single();
  if (error || !data)
    return failed(
      "Je notitie is niet opgeslagen. Je tekst blijft in het formulier staan.",
    );
  return { ok: true, value: noteDocument(data) };
}
export async function saveWritingDocument(
  input: unknown,
): Promise<Result<WritingDocument>> {
  const { supabase, user } = await requireEditorialUser();
  let draft: ReturnType<typeof validateDocument>;
  try {
    draft = validateDocument(input);
  } catch (error) {
    return failed(
      error instanceof Error ? error.message : "Controleer je tekst.",
    );
  }
  const { source, id } = splitKey(draft.key);
  if (source === "note") {
    const version = Number(draft.revision);
    if (!Number.isSafeInteger(version) || version < 1)
      return failed("Ongeldige notitieversie.");
    const { data, error } = await supabase
      .from("admin_writing_notes")
      .update({
        title: draft.title,
        summary: draft.summary,
        sections: draft.sections.map((s) => ({
          id: s.id,
          title: s.title,
          body: s.body,
          kind: s.kind,
        })),
        version: version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("version", version)
      .select("id,title,summary,sections,version,updated_at")
      .maybeSingle();
    if (error)
      return failed(
        "Opslaan lukte niet. Je tekst staat nog in het schrijfvlak.",
      );
    if (!data)
      return failed(
        "Deze notitie is intussen gewijzigd. Je tekst blijft staan; open de nieuwste versie ernaast.",
        true,
      );
    return { ok: true, value: noteDocument(data) };
  }
  const { data, error } = await supabase.rpc("admin_save_publication", {
    p_id: id,
    p_revision: draft.revision,
    p_title: draft.title,
    p_summary: draft.summary,
    p_sections: draft.sections,
  });
  if (error?.code === "40001")
    return failed(
      "Dit artikel is intussen gewijzigd. Je tekst blijft staan; open de nieuwste versie ernaast.",
      true,
    );
  if (error || !data)
    return failed(
      "Opslaan lukte niet. Controleer je toegang of probeer opnieuw; je tekst blijft staan.",
    );
  const saved = publicationDocument(data);
  updateTag(PUBLIC_CONTENT_CACHE_TAG);
  updateTag(DOSSIER_CACHE_TAG);
  for (const path of [
    "/",
    "/artikelen",
    "/onderzoek",
    "/admin",
    "/admin/onderzoeken",
    `/admin/content/${id}`,
    publicContentHref(saved.type, saved.slug!),
  ])
    revalidatePath(path);
  return { ok: true, value: saved };
}
