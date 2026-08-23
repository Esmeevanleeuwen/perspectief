import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireEditorialUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = roleRow?.role ?? "contributor";

  const editorialRoles = [
    "owner",
    "admin",
    "editor",
    "researcher",
    "fact_checker",
  ];

  if (!editorialRoles.includes(role)) {
    redirect("/account");
  }

  return {
    supabase,
    user,
    role,
  };
}