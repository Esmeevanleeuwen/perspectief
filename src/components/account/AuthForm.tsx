"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  login,
  register,
  requestPasswordReset,
  resendConfirmation,
  setPassword,
} from "@/app/(auth)/actions";
import type { FormState } from "@/lib/auth/paths";
import SubmitButton from "./SubmitButton";

type Mode = "login" | "register" | "reset" | "password" | "resend";
const actions = {
  login,
  register,
  reset: requestPasswordReset,
  password: setPassword,
  resend: resendConfirmation,
};
const titles = {
  login: "Inloggen",
  register: "Account maken",
  reset: "Wachtwoord vergeten?",
  password: "Nieuw wachtwoord",
  resend: "Bevestigingsmail aanvragen",
};
const labels = {
  login: "Inloggen →",
  register: "Account maken →",
  reset: "Stuur een herstellink",
  password: "Wachtwoord opslaan",
  resend: "Stuur bevestigingsmail",
};
export default function AuthForm({
  mode,
  next = "/account",
  notice,
}: {
  mode: Mode;
  next?: string;
  notice?: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(
    actions[mode],
    {},
  );
  const [show, setShow] = useState(false);
  const params = `?next=${encodeURIComponent(next)}`;
  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <p className="member-eyebrow">Jouw Meridian</p>
      <h1 id="auth-title">{titles[mode]}</h1>
      <p className="member-muted">
        {mode === "register"
          ? "Lees meer, bewaar wat je raakt en vind de teksten die voor jou zijn klaargezet."
          : mode === "login"
            ? "Ga verder waar je gebleven bent."
            : "We helpen je weer toegang te krijgen tot je account."}
      </p>
      {notice && (
        <p className="member-notice" role="status">
          {notice}
        </p>
      )}
      {state.error && (
        <p className="member-notice member-error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="member-notice" role="status">
          {state.success}
        </p>
      )}
      {!state.success && (
        <form action={action} className="member-form">
          <input type="hidden" name="next" value={next} />
          {mode === "register" && (
            <label>
              Naam of pseudoniem
              <input
                name="display_name"
                autoComplete="nickname"
                maxLength={80}
                required
                defaultValue={state.fields?.display_name}
              />
            </label>
          )}
          {mode !== "password" && (
            <label>
              E-mailadres
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                defaultValue={state.fields?.email}
              />
            </label>
          )}
          {["login", "register", "password"].includes(mode) && (
            <>
              <label>
                Wachtwoord
                <span className="password-field">
                  <input
                    name="password"
                    type={show ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    minLength={mode === "login" ? undefined : 8}
                    maxLength={128}
                    required
                    aria-describedby={
                      mode === "login" ? undefined : "password-help"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-pressed={show}
                    aria-label={
                      show ? "Wachtwoord verbergen" : "Wachtwoord tonen"
                    }
                  >
                    {show ? "Verberg" : "Toon"}
                  </button>
                </span>
              </label>
              {mode !== "login" && (
                <>
                  <small id="password-help">
                    Minimaal 8 tekens. Een lange, unieke wachtzin werkt ook.
                  </small>
                  <label>
                    Herhaal wachtwoord
                    <input
                      name="password_confirmation"
                      type={show ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={128}
                      required
                    />
                  </label>
                </>
              )}
            </>
          )}
          {mode === "register" && (
            <p className="member-muted text-sm">
              Je naam mag een pseudoniem zijn. Je profiel staat standaard op
              privé.
            </p>
          )}
          <SubmitButton>{labels[mode]}</SubmitButton>
        </form>
      )}
      <div className="auth-links">
        {mode === "login" ? (
          <>
            <Link href={"/registreren" + params}>
              Nog geen account? Maak er een aan
            </Link>
            <Link href="/wachtwoord-vergeten">Wachtwoord vergeten?</Link>
            <Link href={"/bevestigen" + params}>
              Geen bevestigingsmail ontvangen?
            </Link>
          </>
        ) : (
          <>
            <Link href={"/login" + params}>Terug naar inloggen</Link>
            {(mode === "register" || mode === "resend") && (
              <Link href={"/bevestigen" + params}>
                Nieuwe bevestigingsmail aanvragen
              </Link>
            )}
            {mode === "password" && (
              <Link href="/wachtwoord-vergeten">
                Nieuwe herstellink aanvragen
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}
