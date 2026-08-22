import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type MeridianRole =
  | "owner"
  | "admin"
  | "editor"
  | "researcher"
  | "fact_checker"
  | "moderator"
  | "contributor";

const editorialRoles: MeridianRole[] = ["owner","admin","editor","researcher","fact_checker"];

export async function requireEditorialUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  const role = (data?.role ?? "contributor") as MeridianRole;

  if (!editorialRoles.includes(role)) redirect("/account");

  return { supabase, user, role };
}
