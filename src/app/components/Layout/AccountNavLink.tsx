import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AccountNavLink() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return <Link href="/login">Inloggen</Link>;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <Link href={user ? "/account" : "/login"}>
      {user ? "Mijn Meridian" : "Inloggen"}
    </Link>
  );
}
