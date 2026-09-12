import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import ProfileForm from "@/components/account/ProfileForm";
export default async function Page() {
  const { supabase, user } = await requireUser("/account/profiel");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name,username,region,bio,public_profile")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error("Je profiel kon niet worden geladen.");
  return (
    <div className="member-profile">
      <h1>Profiel & privacy</h1>
      <p className="member-intro">
        Kies hoe je binnen Meridian wilt heten en wat je over jezelf wilt delen.
      </p>
      <div className="member-profile-grid">
        <section className="member-profile-panel">
          <h2>Je gegevens</h2>
          <ProfileForm profile={profile ?? {}} email={user.email ?? ""} />
        </section>
        <section className="member-profile-panel">
          <h2>Toegang tot je account</h2>
          <p>
            Gebruik een uniek wachtwoord. Via een e-mail aan jezelf kun je het
            veilig opnieuw instellen.
          </p>
          <Link href="/wachtwoord-vergeten" className="member-secondary">
            Wachtwoord herstellen
          </Link>
        </section>
      </div>
    </div>
  );
}
