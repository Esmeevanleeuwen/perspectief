"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/user";
import type { FormState } from "@/lib/auth/paths";
export async function setBookmark(
  _: FormState,
  data: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const id = String(data.get("id") ?? "");
  const save = data.get("save") === "yes";
  const result = save
    ? await supabase
        .from("member_bookmarks")
        .upsert(
          { user_id: user.id, publication_id: id },
          { onConflict: "user_id,publication_id", ignoreDuplicates: true },
        )
    : await supabase
        .from("member_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("publication_id", id);
  if (result.error)
    return {
      error:
        "Bewaren lukte niet. Controleer of de publicatie nog beschikbaar is.",
    };
  revalidatePath("/account", "layout");
  return {
    success: save
      ? "Publicatie opgeslagen."
      : "Publicatie verwijderd uit je opgeslagen items.",
  };
}
