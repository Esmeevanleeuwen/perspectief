import { createClient } from "@/lib/supabase/server";
import { updatePreferences, updateProfile } from "../actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("account_preferences").select("*").eq("user_id", user!.id).single(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:px-10">
      <h1 className="font-serif text-5xl">Profiel & privacy</h1>

      <form action={updateProfile} className="mt-10 space-y-5">
        <input name="display_name" defaultValue={profile?.display_name ?? ""} placeholder="Naam of pseudoniem" className="field" />
        <input name="username" defaultValue={profile?.username ?? ""} placeholder="Gebruikersnaam" className="field" />
        <input name="region" defaultValue={profile?.region ?? ""} placeholder="Regio — optioneel" className="field" />
        <textarea name="bio" defaultValue={profile?.bio ?? ""} rows={4} placeholder="Context — optioneel" className="field resize-none" />
        <select name="contribution_visibility" defaultValue={profile?.contribution_visibility ?? "name"} className="field">
          <option value="name">Naam</option>
          <option value="pseudonym">Pseudoniem</option>
          <option value="anonymous">Anoniem</option>
        </select>
        <label className="flex gap-3"><input type="checkbox" name="public_profile" defaultChecked={Boolean(profile?.public_profile)} /> Publiek profiel</label>
        <button className="bg-[#102534] px-6 py-3 text-sm text-white">Opslaan</button>
      </form>

      <form action={updatePreferences} className="mt-16 space-y-5 border-t border-[#102534]/10 pt-10">
        <h2 className="font-serif text-3xl">Wat mag Meridian onthouden?</h2>
        <Toggle name="remember_reading_history" checked={Boolean(prefs?.remember_reading_history)} label="Leesgeschiedenis" />
        <Toggle name="remember_topic_state" checked={Boolean(prefs?.remember_topic_state)} label="Tijdelijke onderwerpstatus" />
        <Toggle name="local_recommendations" checked={Boolean(prefs?.local_recommendations)} label="Lokale relevantie" />
        <Toggle name="email_updates" checked={Boolean(prefs?.email_updates)} label="E-mailupdates" />
        <button className="bg-[#102534] px-6 py-3 text-sm text-white">Voorkeuren opslaan</button>
      </form>
    </div>
  );
}

function Toggle({ name, checked, label }: { name: string; checked: boolean; label: string }) {
  return <label className="flex gap-3"><input type="checkbox" name={name} defaultChecked={checked} /> {label}</label>;
}
