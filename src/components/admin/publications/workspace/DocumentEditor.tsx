"use client";
import Link from "next/link";
import WritingMenu from "./WritingMenu";
import WritingText from "./WritingText";
import {
  optionLabel,
  publicationTypes,
  publicationStatuses,
} from "@/lib/admin/publications/model";
import {
  linkedKeys,
  splitKey,
  type ItemKey,
  type WritingDocument,
  type WritingState,
} from "@/lib/admin/writing/model";

export default function DocumentEditor({
  document,
  state,
  dirty,
  saving,
  error,
  conflict,
  title,
  onChange,
  onSave,
  onMembership,
  onConnect,
  onUnlink,
  onReference,
  onLatest,
  onOpen,
  onFocus,
}: {
  document: WritingDocument;
  state: WritingState;
  dirty: boolean;
  saving: boolean;
  error: string;
  conflict: boolean;
  title: (key: ItemKey) => string;
  onChange: (doc: WritingDocument) => void;
  onSave: () => void;
  onMembership: (id: string, included: boolean) => void;
  onConnect: (key: ItemKey) => void;
  onUnlink: (key: ItemKey) => void;
  onReference: (key: ItemKey) => void;
  onLatest: () => void;
  onOpen: (key: ItemKey) => void;
  onFocus: () => void;
}) {
  const connected = linkedKeys(state, document.key),
    otherTabs = state.view.tabs.filter(
      (key) => key !== document.key && !connected.includes(key),
    );
  const setSection = (
    index: number,
    change: { title?: string; body?: string },
  ) =>
    onChange({
      ...document,
      sections: document.sections.map((s, i) =>
        i === index ? { ...s, ...change } : s,
      ),
    });
  return (
    <>
      <div className="writing-editor-top">
        <span className="writing-save-status" role="status">
          {dirty
            ? "Nog niet opgeslagen"
            : document.editable
              ? "Opgeslagen"
              : "Alleen lezen"}
        </span>
        <div className="writing-editor-actions">
          {document.editable && (
            <button
              type="button"
              className="member-button"
              disabled={!dirty || saving}
              onClick={onSave}
            >
              {saving
                ? "Opslaan…"
                : document.status === "published"
                  ? "Wijzigingen live opslaan"
                  : "Tekst opslaan"}
            </button>
          )}
          <WritingMenu
            className="writing-document-menu"
            label="⋯"
            ariaLabel="Opties voor deze tekst"
          >
            <p className="writing-label">
              {document.type === "note"
                ? "Privénotitie"
                : optionLabel(publicationTypes, document.type)}{" "}
              · {optionLabel(publicationStatuses, document.status)}
            </p>
            <details className="writing-organize">
              <summary>In mappen</summary>
              <fieldset className="writing-memberships">
                <legend>In mappen</legend>
                {state.collections.map((c) => (
                  <label className="writing-check" key={c.id}>
                    <input
                      type="checkbox"
                      checked={c.items.includes(document.key)}
                      onChange={(e) => onMembership(c.id, e.target.checked)}
                    />
                    {c.name}
                  </label>
                ))}
                {!state.collections.length && (
                  <span>Maak eerst een map aan.</span>
                )}
              </fieldset>
            </details>
            <section className="writing-connections">
              <h3>
                Verbonden stukken <span>{connected.length}</span>
              </h3>
              {connected.map((key) => (
                <div className="writing-link" key={key}>
                  <button
                    type="button"
                    data-close-menu
                    onClick={() => onOpen(key)}
                  >
                    {title(key)}
                  </button>
                  <button
                    type="button"
                    data-close-menu
                    onClick={() => onReference(key)}
                  >
                    Ernaast
                  </button>
                  <button
                    type="button"
                    aria-label={`Ontkoppel ${title(key)}`}
                    onClick={() => onUnlink(key)}
                  >
                    Ontkoppel
                  </button>
                </div>
              ))}
              {otherTabs.length > 0 && (
                <form
                  className="writing-connect-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onConnect(
                      String(
                        new FormData(e.currentTarget).get("key"),
                      ) as ItemKey,
                    );
                  }}
                >
                  <label>
                    Koppel een open stuk
                    <select name="key">
                      {otherTabs.map((key) => (
                        <option value={key} key={key}>
                          {title(key)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit">Koppelen</button>
                </form>
              )}
              {!connected.length && !otherTabs.length && (
                <p className="writing-hint">
                  Open een tweede stuk om zelf een verband te leggen.
                </p>
              )}
            </section>
            <button type="button" data-close-menu onClick={onFocus}>
              {state.view.mode === "focus"
                ? "Lijst weergeven"
                : "Alleen schrijfvlak"}
            </button>
            {document.key.startsWith("publication:") && (
              <Link href={`/admin/content/${splitKey(document.key).id}`}>
                Publicatie-instellingen ↗
              </Link>
            )}
          </WritingMenu>
        </div>
      </div>
      {error && (
        <div role="alert" className="writing-error">
          <p>{error}</p>
          {conflict && (
            <button type="button" onClick={onLatest}>
              Nieuwste versie ernaast
            </button>
          )}
        </div>
      )}
      <div className="writing-page">
        <label className="writing-title-label">
          <span className="writing-visually-hidden">Titel</span>
          <WritingText
            className="writing-title"
            placeholder="Titel"
            rows={Math.min(
              4,
              Math.max(1, Math.ceil(document.title.length / 45)),
            )}
            value={document.title}
            readOnly={!document.editable}
            maxLength={500}
            onChange={(e) => onChange({ ...document, title: e.target.value })}
          />
        </label>
        <details
          className="writing-summary"
          open={document.sections.length === 0 || undefined}
        >
          <summary>Samenvatting</summary>
          <label>
            <span className="writing-visually-hidden">
              Samenvatting van dit stuk
            </span>
            <WritingText
              rows={3}
              maxLength={100000}
              value={document.summary}
              readOnly={!document.editable}
              onChange={(e) =>
                onChange({ ...document, summary: e.target.value })
              }
            />
          </label>
        </details>
        <div className="writing-sections">
          {document.sections.map((s, index) => (
            <section className="writing-section" key={s.id}>
              <label className={s.title ? "" : "writing-optional-heading"}>
                <span className="writing-visually-hidden">
                  Titel sectie {index + 1}
                </span>
                <input
                  className="writing-section-title"
                  placeholder="Kop toevoegen…"
                  maxLength={500}
                  value={s.title}
                  readOnly={!document.editable}
                  onChange={(e) => setSection(index, { title: e.target.value })}
                />
              </label>
              <label>
                <span className="writing-visually-hidden">
                  Tekst sectie {index + 1}
                </span>
                <WritingText
                  value={s.body}
                  readOnly={!document.editable}
                  rows={3}
                  placeholder="Begin met schrijven…"
                  maxLength={200000}
                  onChange={(e) => setSection(index, { body: e.target.value })}
                />
              </label>
              {Array.isArray(s.data?.points) && s.data.points.length > 0 && (
                <ul className="writing-block-points">
                  {s.data.points
                    .filter((p): p is string => typeof p === "string")
                    .map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                </ul>
              )}
              {!["paragraph", "heading", "intro", "quote"].includes(s.kind) && (
                <details className="writing-block-settings">
                  <summary>Blokinstellingen</summary>
                  <p className="writing-hint">
                    De aanvullende instellingen voor dit blok staan bij
                    Publicatie-instellingen.
                  </p>
                </details>
              )}
            </section>
          ))}
        </div>
        {document.editable && (
          <div className="writing-row writing-save-row">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                onChange({
                  ...document,
                  sections: [
                    ...document.sections,
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      body: "",
                      kind: "paragraph",
                      fresh: true,
                    },
                  ],
                })
              }
            >
              + Sectie
            </button>
          </div>
        )}
        {connected.length > 0 && (
          <nav className="writing-related" aria-label="Verbonden teksten">
            <span>Verbonden</span>
            {connected.map((key) => (
              <button type="button" key={key} onClick={() => onOpen(key)}>
                {title(key)}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
