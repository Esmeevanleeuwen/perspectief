"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/user";
import type { FormState } from "@/lib/auth/paths";
export async function saveProfile(
  _: FormState,
  data: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser("/account/profiel");
  const text = (k: string) => String(data.get(k) ?? "").trim();
  const display_name = text("display_name"),
    username = text("username").toLowerCase(),
    region = text("region"),
    bio = text("bio");
  if (
    !display_name ||
    display_name.length > 80 ||
    (username && !/^[a-z0-9_]{3,30}$/.test(username)) ||
    region.length > 100 ||
    bio.length > 1000
  )
    return { error: "Controleer je naam, gebruikersnaam en tekstlengte." };
  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      display_name,
      username: username || null,
      region: region || null,
      bio: bio || null,
      public_profile: data.get("public_profile") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !updated)
    return {
      error:
        error?.code === "23505"
          ? "Deze gebruikersnaam is al in gebruik."
          : "Opslaan lukte niet. Probeer het opnieuw.",
    };
  revalidatePath("/account", "layout");
  return { success: "Je profiel is opgeslagen." };
}
