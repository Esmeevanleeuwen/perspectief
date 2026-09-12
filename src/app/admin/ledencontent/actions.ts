"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMemberAdmin } from "@/lib/auth/user";
import { makeSlug } from "@/lib/admin/slug";
import type { FormState } from "@/lib/auth/paths";
import type { Member } from "@/lib/members";
const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();
export async function searchMembers(
  query: string,
): Promise<{ members: Member[]; error?: string }> {
  const { supabase } = await requireMemberAdmin();
  const { data, error } = await supabase.rpc("member_directory", {
    p_query: query.slice(0, 100),
  });
  return error
    ? { members: [], error: "Gebruikers laden lukte niet." }
    : { members: (data ?? []) as Member[] };
}
export async function savePublication(
  _: FormState,
  data: FormData,
): Promise<FormState> {
  const { supabase } = await requireMemberAdmin();
  const title = text(data, "title"),
    slug = makeSlug(text(data, "slug") || title),
    body = text(data, "body"),
    summary = text(data, "summary"),
    status = text(data, "status"),
    audience = text(data, "audience"),
    kind = text(data, "kind");
  let recipients: string[];
  try {
    const parsed: unknown = JSON.parse(text(data, "recipients") || "[]");
    if (
      !Array.isArray(parsed) ||
      parsed.some(
        (id) => typeof id !== "string" || !/^[a-f0-9-]{36}$/i.test(id),
      )
    )
      throw Error();
    recipients = [...new Set(parsed)] as string[];
  } catch {
    return { error: "Controleer de geselecteerde gebruikers." };
  }
  if (
    !title ||
    title.length > 180 ||
    !slug ||
    slug.length > 150 ||
    summary.length > 500 ||
    body.length > 200000 ||
    !["draft", "published"].includes(status) ||
    !["members", "selected"].includes(audience) ||
    !["article", "text"].includes(kind)
  )
    return { error: "Controleer de titel, tekst en publicatie-instellingen." };
  if (status === "published" && !body)
    return { error: "Voeg eerst tekst toe voordat je publiceert." };
  if (audience === "selected" && status === "published" && !recipients.length)
    return { error: "Selecteer minimaal één gebruiker of kies alle leden." };
  if (recipients.length > 100)
    return { error: "Selecteer maximaal 100 gebruikers per publicatie." };
  const { data: id, error } = await supabase.rpc("save_member_publication", {
    p_id: text(data, "id") || null,
    p_title: title,
    p_slug: slug,
    p_summary: summary,
    p_body: body,
    p_kind: kind,
    p_audience: audience,
    p_status: status,
    p_recipients: audience === "selected" ? recipients : [],
  });
  if (error)
    return {
      error:
        error.code === "23505"
          ? "Deze URL is al in gebruik. Kies een andere URL."
          : "Opslaan lukte niet. Je tekst staat nog in het formulier; probeer het opnieuw.",
    };
  revalidatePath("/account", "layout");
  revalidatePath("/admin/ledencontent", "layout");
  redirect(`/admin/ledencontent/${id}?saved=1`);
}
export async function deletePublication(
  _: FormState,
  data: FormData,
): Promise<FormState> {
  const { supabase } = await requireMemberAdmin();
  if (data.get("confirm") !== "on")
    return { error: "Bevestig eerst dat je deze publicatie wilt verwijderen." };
  const { data: deleted, error } = await supabase
    .from("member_publications")
    .delete()
    .eq("id", text(data, "id"))
    .select("id")
    .maybeSingle();
  if (error || !deleted)
    return { error: "Verwijderen lukte niet. Probeer het opnieuw." };
  revalidatePath("/account", "layout");
  revalidatePath("/admin/ledencontent", "layout");
  redirect("/admin/ledencontent?deleted=1");
}
