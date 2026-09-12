import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import HeaderAccount from "./HeaderAccount";

const isSignedIn = cache(async () => {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user && !user.is_anonymous);
  } catch {
    return false;
  }
});

export default async function AccountNavLink({
  variant = "header",
}: {
  variant?: "header" | "mobile";
}) {
  return <HeaderAccount signedIn={await isSignedIn()} variant={variant} />;
}
