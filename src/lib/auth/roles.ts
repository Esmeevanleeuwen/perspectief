import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type MeridianRole = "owner" | "editor" | "contributor";

export async function getSessionContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null as MeridianRole | null };

  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  return { supabase, user, role: (data?.role ?? "contributor") as MeridianRole };
}

export async function requireUser() {
  const ctx = await getSessionContext();
  if (!ctx.user) redirect("/login");
  return { ...ctx, user: ctx.user };
}

export async function requireEditor() {
  const ctx = await requireUser();
  if (!ctx.role || !["owner", "editor"].includes(ctx.role)) redirect("/account");
  return ctx;
}
