import { isSupabaseConfigured } from "@/lib/supabase/config";
import AuthForm from "@/components/account/AuthForm";
import { safeNext } from "@/lib/auth/paths";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; message?: string }>;
}) {
  const query = await searchParams;
  const notice =
    query.error === "auth_callback"
      ? "Deze link is ongeldig of verlopen. Vraag een nieuwe bevestigingsmail of herstellink aan."
      : query.message === "signed_out"
        ? "Je bent uitgelogd."
        : query.message === "check_email"
          ? "Controleer je e-mail om je account te bevestigen."
          : undefined;
  return (
    <AuthForm
      enabled={isSupabaseConfigured()}
      mode="resend"
      next={safeNext(query.next)}
      notice={notice}
    />
  );
}
