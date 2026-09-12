import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNext } from "./paths";

export const requireUser = cache(async (next = "/account") => {
  if (!isSupabaseConfigured())
    redirect(
      `/login?error=unavailable&next=${encodeURIComponent(safeNext(next))}`,
    );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous)
    redirect(`/login?next=${encodeURIComponent(safeNext(next))}`);
  return { supabase, user };
});

export async function requireMemberAdmin() {
  const { supabase, user } = await requireUser("/admin/ledencontent");
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!["owner", "admin"].includes(data?.role ?? "")) redirect("/account");
  return { supabase, user };
}
