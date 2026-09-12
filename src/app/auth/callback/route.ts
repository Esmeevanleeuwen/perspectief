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
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(new URL(next, url.origin), {
        headers: { "Cache-Control": "private, no-store" },
      });
  }
  return NextResponse.redirect(
    new URL(
      `/login?error=auth_callback&next=${encodeURIComponent(next)}`,
      url.origin,
    ),
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
