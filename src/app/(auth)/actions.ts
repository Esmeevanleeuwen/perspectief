"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const field = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/account");
}

export async function signUp(formData: FormData) {
  const email = field(formData, "email");
  const password = field(formData, "password");
  if (!email || password.length < 8) redirect("/registreren?error=Gebruik een geldig e-mailadres en minimaal 8 tekens.");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: field(formData, "display_name") || undefined } },
  });
  if (error) redirect(`/registreren?error=${encodeURIComponent(error.message)}`);
  if (!data.session) redirect("/login?message=Controleer je e-mail om je account te bevestigen.");
  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
