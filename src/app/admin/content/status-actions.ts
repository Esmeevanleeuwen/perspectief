"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireEditorialUser } from "@/lib/admin/roles";
import { isPublicationStatus, type StatusChangeInput, type StatusChangeResult } from "@/lib/admin/publications/status";
import type { Result } from "@/lib/admin/writing/model";
import { uuidPattern } from "@/lib/publishing/model";
import { PUBLIC_CONTENT_CACHE_TAG, DOSSIER_CACHE_TAG } from "@/lib/public-cache";

export async function changePublicationStatus(input: StatusChangeInput): Promise<Result<StatusChangeResult>> {
  // Never trust a hidden control or a role sent by the browser.
  const { supabase } = await requireEditorialUser();
  if (!input || typeof input !== "object" || typeof input.id !== "string" || !uuidPattern.test(input.id)
    || !isPublicationStatus(input.status) || typeof input.updatedAt !== "string"
    || input.updatedAt.length > 50 || !Number.isFinite(Date.parse(input.updatedAt))
    || (input.confirmed !== undefined && typeof input.confirmed !== "boolean")) {
    return { ok: false, message: "Kies een geldige publicatie en status." };
  }
  try {
    const { data, error } = await supabase.rpc("admin_change_publication_status", {
      p_id: input.id, p_status: input.status, p_updated_at: input.updatedAt, p_confirmed: input.confirmed === true,
    });
    if (error) {
      if (error.code === "40001") return { ok: false, conflict: true, message: "Dit artikel is intussen gewijzigd. Ververs het overzicht en kies de status opnieuw." };
      if (error.code === "42501") return { ok: false, message: "Je hebt geen rechten om de status van dit artikel te wijzigen." };
      if (error.code === "P0002") return { ok: false, message: "Deze publicatie is niet meer beschikbaar. Ververs het overzicht." };
      const messages: Record<string, string> = {
        "Use article publishing": "Gebruik Publiceren om de websites te kiezen en het artikel te publiceren.",
        "Write content before publishing": "Vul eerst een titel en artikeltekst in voordat je publiceert.",
      };
      return { ok: false, message: messages[error.message] ?? "Status opslaan is niet gelukt. Probeer opnieuw." };
    }
    if (!data) return { ok: false, message: "De status kon niet worden gecontroleerd. Ververs het overzicht." };
    const value = data as StatusChangeResult;
    if (!value.confirmation_required) {
      updateTag(PUBLIC_CONTENT_CACHE_TAG);
      updateTag(DOSSIER_CACHE_TAG);
      for (const path of ["/", "/artikelen", "/onderzoek", "/sitemap.xml", "/admin", "/admin/content", "/admin/onderzoeken", "/admin/werkplek", `/admin/content/${input.id}`]) revalidatePath(path);
      revalidatePath("/onderzoek/[slug]", "page");
    }
    return { ok: true, value };
  } catch {
    return { ok: false, message: "Opslaan of verversen is onderbroken. Ververs het overzicht om de opgeslagen status te controleren." };
  }
}
