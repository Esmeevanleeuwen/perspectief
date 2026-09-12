"use client";
import { useActionState, useState } from "react";
import { saveProfile } from "@/app/account/profile-actions";
import SubmitButton from "./SubmitButton";
export default function ProfileForm({
  profile,
  email,
}: {
  profile: {
    display_name?: string;
    username?: string;
    region?: string;
    bio?: string;
    public_profile?: boolean;
  };
  email: string;
}) {
  const [state, action] = useActionState(saveProfile, {});
  const [values, setValues] = useState(profile);
  return (
    <form action={action} className="member-form">
      <label>
        E-mailadres
        <input type="email" value={email} readOnly />
      </label>
      <label>
        Naam of pseudoniem
        <input
          name="display_name"
          value={values.display_name ?? ""}
          onChange={(e) =>
            setValues({ ...values, display_name: e.target.value })
          }
          required
          maxLength={80}
          autoComplete="nickname"
        />
      </label>
      <label>
        Gebruikersnaam (optioneel)
        <input
          name="username"
          value={values.username ?? ""}
          onChange={(e) => setValues({ ...values, username: e.target.value })}
          pattern="[a-zA-Z0-9_]{3,30}"
          maxLength={30}
          aria-describedby="username-help"
        />
      </label>
      <small id="username-help">
        3–30 letters, cijfers of underscores. Je kunt dit ook leeg laten.
      </small>
      <label>
        Regio (optioneel)
        <input
          name="region"
          value={values.region ?? ""}
          onChange={(e) => setValues({ ...values, region: e.target.value })}
          maxLength={100}
        />
      </label>
      <label>
        Over jou (optioneel)
        <textarea
          name="bio"
          value={values.bio ?? ""}
          onChange={(e) => setValues({ ...values, bio: e.target.value })}
          rows={4}
          maxLength={1000}
        />
      </label>
      <label className="member-toggle">
        <input
          name="public_profile"
          type="checkbox"
          checked={Boolean(values.public_profile)}
          onChange={(e) =>
            setValues({ ...values, public_profile: e.target.checked })
          }
        />{" "}
        Mijn profiel openbaar maken
      </label>
      <small>
        Uitgevinkt? Dan blijft je profiel privé voor jou en de redactie. Je
        e-mailadres wordt niet openbaar getoond.
      </small>
      {state.error && (
        <p role="alert" className="member-notice member-error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="member-notice">
          {state.success}
        </p>
      )}
      <SubmitButton>Profiel opslaan</SubmitButton>
    </form>
  );
}
