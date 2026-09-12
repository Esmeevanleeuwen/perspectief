"use client";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
  savePublication,
  searchMembers,
  deletePublication,
} from "@/app/admin/ledencontent/actions";
import type { Member, MemberPublication } from "@/lib/members";
import SubmitButton from "./SubmitButton";
export default function MemberEditor({
  item,
  recipients = [],
  members = [],
}: {
  item?: MemberPublication;
  recipients?: Member[];
  members?: Member[];
}) {
  const [state, action] = useActionState(savePublication, {});
  const [deletion, deleteAction] = useActionState(deletePublication, {});
  const [audience, setAudience] = useState(
    item?.audience ?? (recipients.length ? "selected" : "members"),
  );
  const [selected, setSelected] = useState(recipients);
  const [results, setResults] = useState(members);
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState(false);
  const [body, setBody] = useState(item?.body ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [summary, setSummary] = useState(item?.summary ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [kind, setKind] = useState(item?.kind ?? "article");
  const [status, setStatus] = useState(item?.status ?? "draft");
  function search() {
    startTransition(async () => {
      try {
        const result = await searchMembers(query);
        setResults(result.members);
        setSearchError(result.error ?? "");
      } catch {
        setSearchError("Zoeken lukte niet. Probeer het opnieuw.");
      }
    });
  }
  return (
    <>
      <form action={action} className="member-editor">
        <input type="hidden" name="id" value={item?.id ?? ""} />
        <input
          type="hidden"
          name="recipients"
          value={JSON.stringify(selected.map((m) => m.id))}
        />
        <div className="member-editor-main">
          <div className="member-editor-toolbar">
            <span className="member-eyebrow">
              {item ? "Publicatie bewerken" : "Nieuwe ledenpublicatie"}
            </span>
            <button
              type="button"
              className="member-text-button"
              aria-pressed={preview}
              onClick={() => setPreview(!preview)}
            >
              {preview ? "Verder schrijven" : "Leesvoorbeeld"}
            </button>
          </div>
          <div hidden={preview} className="member-form">
            <label>
              Titel
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={180}
                placeholder="Geef je publicatie een titel"
              />
            </label>
            <label>
              Korte introductie
              <textarea
                name="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Waar gaat deze publicatie over?"
              />
            </label>
            <label>
              Tekst
              <textarea
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={200000}
                rows={22}
                placeholder="Begin met schrijven. Gebruik een lege regel voor een nieuwe alinea."
              />
            </label>
            <p className="member-muted">
              {body.length.toLocaleString("nl-NL")} tekens · De opmaak behoudt
              je alinea’s.
            </p>
          </div>
          {preview && (
            <article className="member-editor-preview">
              <p className="member-eyebrow">
                Leesvoorbeeld · nog niet opgeslagen
              </p>
              <h1>{title || "Je titel"}</h1>
              {summary && <p className="member-lead">{summary}</p>}
              <div className="member-reading-body">
                {body.split(/\n\s*\n/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </article>
          )}
        </div>
        <aside className="member-editor-settings">
          <h2>Publiceren & toegang</h2>
          <div className="member-form">
            <label>
              Soort
              <select
                name="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as "article" | "text")}
              >
                <option value="article">Artikel</option>
                <option value="text">Tekst / persoonlijk bericht</option>
              </select>
            </label>
            <label>
              URL-naam
              <input
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                maxLength={150}
                placeholder="Automatisch vanuit de titel"
              />
            </label>
            <label>
              Status
              <select
                name="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "draft" | "published")
                }
              >
                <option value="draft">Concept — alleen voor beheerders</option>
                <option value="published">
                  Gepubliceerd — zichtbaar voor ontvangers
                </option>
              </select>
            </label>
            <label>
              Wie mag dit lezen?
              <select
                name="audience"
                value={audience}
                onChange={(e) =>
                  setAudience(e.target.value as "members" | "selected")
                }
              >
                <option value="members">Alle gebruikers met een account</option>
                <option value="selected">
                  Alleen geselecteerde gebruikers
                </option>
              </select>
            </label>
            {audience === "selected" && (
              <fieldset className="member-recipients">
                <legend>Ontvangers ({selected.length})</legend>
                <p className="member-muted">
                  Alleen deze accounts kunnen de gepubliceerde tekst openen.
                </p>
                <div className="member-selected">
                  {selected.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        setSelected(selected.filter((s) => s.id !== m.id))
                      }
                      aria-label={`Verwijder ${m.email} als ontvanger`}
                    >
                      {m.display_name || m.email}{" "}
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
                <label>
                  Zoek naam of e-mailadres
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    maxLength={100}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        search();
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="member-secondary"
                  disabled={pending}
                  onClick={search}
                >
                  {pending ? "Zoeken…" : "Zoek gebruikers"}
                </button>
                {searchError && <p role="alert">{searchError}</p>}
                <div className="member-user-results">
                  {results.map((m) => (
                    <label key={m.id}>
                      <input
                        type="checkbox"
                        checked={selected.some((s) => s.id === m.id)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, m]
                              : selected.filter((s) => s.id !== m.id),
                          )
                        }
                      />
                      <span>
                        <strong>{m.display_name || "Gebruiker"}</strong>
                        <small>{m.email}</small>
                      </span>
                    </label>
                  ))}
                  {!results.length && <p>Geen gebruikers gevonden.</p>}
                </div>
                <small>
                  Maximaal 100 resultaten. Zoek specifieker om andere accounts
                  te vinden.
                </small>
              </fieldset>
            )}
            <p className="member-notice">
              Concepten zijn alleen voor beheerders zichtbaar. Gepubliceerde
              teksten verschijnen direct in de bibliotheek van de gekozen
              lezers.
            </p>
            {state.error && (
              <p role="alert" className="member-notice member-error">
                {state.error}
              </p>
            )}
            <SubmitButton pendingLabel="Publicatie opslaan…">
              Wijzigingen opslaan
            </SubmitButton>
            <Link href="/admin/ledencontent">Terug naar overzicht</Link>
          </div>
        </aside>
      </form>
      {item && (
        <details className="member-delete">
          <summary>Publicatie verwijderen</summary>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <p>
              De tekst, toegangstoewijzingen en opgeslagen verwijzingen worden
              verwijderd.
            </p>
            <label>
              <input type="checkbox" name="confirm" required /> Ja, verwijder ‘
              {item.title}’ definitief.
            </label>
            {deletion.error && <p role="alert">{deletion.error}</p>}
            <SubmitButton className="member-danger">
              Definitief verwijderen
            </SubmitButton>
          </form>
        </details>
      )}
    </>
  );
}
