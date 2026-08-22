import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AccountNavLink() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <Link href={user ? "/account" : "/login"}>
      {user ? "Mijn Meridian" : "Inloggen"}
    </Link>
  );
}
