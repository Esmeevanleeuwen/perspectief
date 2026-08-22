"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();

  await supabase.from("profiles").update({
    display_name: text(formData, "display_name") || null,
    username: text(formData, "username").toLowerCase() || null,
    bio: text(formData, "bio") || null,
    region: text(formData, "region") || null,
    public_profile: formData.get("public_profile") === "on",
    contribution_visibility: text(formData, "contribution_visibility") || "name",
    updated_at: new Date().toISOString(),
  }).eq("id", user.id);

  revalidatePath("/account/profiel");
  redirect("/account/profiel?saved=1");
}

export async function updatePreferences(formData: FormData) {
  const { supabase, user } = await requireUser();

  await supabase.from("account_preferences").update({
    remember_reading_history: formData.get("remember_reading_history") === "on",
    remember_topic_state: formData.get("remember_topic_state") === "on",
    local_recommendations: formData.get("local_recommendations") === "on",
    email_updates: formData.get("email_updates") === "on",
    updated_at: new Date().toISOString(),
  }).eq("user_id", user.id);

  revalidatePath("/account/profiel");
}

export async function saveItem(formData: FormData) {
  const { supabase, user } = await requireUser();

  await supabase.from("saved_items").upsert({
    user_id: user.id,
    item_type: text(formData, "item_type"),
    item_id: text(formData, "item_id"),
    title: text(formData, "title"),
  }, {
    onConflict: "user_id,item_type,item_id",
  });
}
