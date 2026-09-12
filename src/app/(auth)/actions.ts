"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authOrigin, safeNext, type FormState } from "@/lib/auth/paths";

const value = (data: FormData, key: string) =>
  String(data.get(key) ?? "").trim();
const passwordValue = (data: FormData) => String(data.get("password") ?? "");
function message(code?: string) {
  if (code === "email_not_confirmed")
    return "Bevestig eerst je e-mailadres. Je kunt hieronder een nieuwe bevestigingsmail aanvragen.";
  if (code?.includes("rate_limit") || code === "over_email_send_rate_limit")
    return "Er zijn te veel pogingen gedaan. Wacht even en probeer het opnieuw.";
  if (code === "weak_password")
    return "Kies een sterker wachtwoord van minimaal 8 tekens.";
  if (code === "same_password")
    return "Kies een ander wachtwoord dan je huidige wachtwoord.";
  return "Dit lukte niet. Controleer je gegevens en probeer het opnieuw.";
}
function callback(next: string) {
  return `${authOrigin()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
}

export async function login(_: FormState, data: FormData): Promise<FormState> {
  const fields = { email: value(data, "email") };
  let failed: string | undefined;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: fields.email,
      password: passwordValue(data),
    });
    if (error)
      failed =
        error.code === "invalid_credentials"
          ? "Je e-mailadres of wachtwoord klopt niet."
          : message(error.code);
  } catch {
    failed = "Inloggen is tijdelijk niet beschikbaar. Probeer het zo opnieuw.";
  }
  if (failed) return { error: failed, fields };
  revalidatePath("/", "layout");
  redirect(safeNext(data.get("next")));
}

export async function register(
  _: FormState,
  data: FormData,
): Promise<FormState> {
  const fields = {
    email: value(data, "email"),
    display_name: value(data, "display_name"),
  };
  const password = passwordValue(data);
  if (
    !fields.display_name ||
    fields.display_name.length > 80 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) ||
    password.length < 8 ||
    password.length > 128
  )
    return {
      error:
        "Vul een naam, geldig e-mailadres en wachtwoord van 8 tot 128 tekens in.",
      fields,
    };
  if (password !== String(data.get("password_confirmation") ?? ""))
    return { error: "De wachtwoorden zijn niet gelijk.", fields };
  let hasSession = false;
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase.auth.signUp({
      email: fields.email,
      password,
      options: {
        data: { display_name: fields.display_name },
        emailRedirectTo: callback(safeNext(data.get("next"))),
      },
    });
    if (error) return { error: message(error.code), fields };
    hasSession = Boolean(result.session);
  } catch {
    return {
      error:
        "Registreren is tijdelijk niet beschikbaar. Probeer het zo opnieuw.",
      fields,
    };
  }
  if (!hasSession)
    return {
      success:
        "Controleer je e-mail om je account te bevestigen. Kijk ook in je spammap. Heb je al een account? Log dan in of herstel je wachtwoord.",
      fields,
    };
  revalidatePath("/", "layout");
  redirect(safeNext(data.get("next")));
}

export async function resendConfirmation(
  _: FormState,
  data: FormData,
): Promise<FormState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: value(data, "email"),
      options: { emailRedirectTo: callback(safeNext(data.get("next"))) },
    });
    if (error && error.status === 429) return { error: message("rate_limit") };
    if (error && (error.status ?? 0) >= 500)
      return {
        error:
          "De e-mail kon niet worden verstuurd. Probeer het later opnieuw.",
      };
  } catch {
    return {
      error: "De e-mail kon niet worden verstuurd. Probeer het later opnieuw.",
    };
  }
  return {
    success:
      "Als je account nog op bevestiging wacht, ontvang je een nieuwe e-mail. Kijk ook in je spammap.",
  };
}

export async function requestPasswordReset(
  _: FormState,
  data: FormData,
): Promise<FormState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      value(data, "email"),
      { redirectTo: callback("/wachtwoord-instellen") },
    );
    if (error) return { error: message(error.code) };
  } catch {
    return {
      error: "We konden je aanvraag niet verwerken. Probeer het later opnieuw.",
    };
  }
  return {
    success:
      "Als er een account bij dit e-mailadres hoort, ontvang je een link om je wachtwoord te herstellen.",
  };
}

export async function setPassword(
  _: FormState,
  data: FormData,
): Promise<FormState> {
  const password = passwordValue(data);
  if (password.length < 8 || password.length > 128)
    return { error: "Gebruik een wachtwoord van 8 tot 128 tekens." };
  if (password !== String(data.get("password_confirmation") ?? ""))
    return { error: "De wachtwoorden zijn niet gelijk." };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.is_anonymous)
      return {
        error: "De herstellink is verlopen. Vraag een nieuwe link aan.",
      };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: message(error.code) };
  } catch {
    return { error: "Opslaan lukte niet. Probeer het opnieuw." };
  }
  revalidatePath("/", "layout");
  redirect("/account?password_updated=1");
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) redirect("/account?error=signout");
  revalidatePath("/", "layout");
  redirect("/login?message=signed_out");
}
