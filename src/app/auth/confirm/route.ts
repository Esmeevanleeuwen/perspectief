import { isSupabaseConfigured } from "@/lib/supabase/config";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/paths";
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!isSupabaseConfigured())
    return NextResponse.redirect(
      new URL("/login?error=unavailable", url.origin),
    );
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next =
    type === "recovery"
      ? "/wachtwoord-instellen"
      : safeNext(url.searchParams.get("next"));
  if (
    token_hash &&
    (type === "email" ||
      type === "recovery" ||
      type === "signup" ||
      type === "invite")
  ) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error)
      return NextResponse.redirect(new URL(next, url.origin), {
        headers: {
          "Cache-Control": "private, no-store",
          "Referrer-Policy": "no-referrer",
        },
      });
  }
  return NextResponse.redirect(
    new URL("/login?error=auth_callback", url.origin),
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
