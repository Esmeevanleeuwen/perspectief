"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function login(formData: FormData) {
  const email = value(formData, "email");
  const password = value(formData, "password");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/account");
}

export async function register(formData: FormData) {
  const displayName = value(formData, "display_name");
  const email = value(formData, "email");
  const password = value(formData, "password");

  if (!email || password.length < 8) {
    redirect("/registreren?error=invalid_fields");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || undefined },
    },
  });

  if (error) {
    redirect(`/registreren?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect("/login?message=check_email");
  }

  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
