"use client";
import type {
  ItemKey,
  WritingView,
  WritingSession,
} from "@/lib/admin/writing/model";

export default function DocumentTabs({
  view,
  title,
  dirty,
  onOpen,
  onClose,
  onSaveSession,
  sessions,
  onSession,
  onRemoveSession,
}: {
  sessions: WritingSession[];
  onSession: (id: string) => void;
  onRemoveSession: (id: string) => void;
  view: WritingView;
  title: (key: ItemKey) => string;
  dirty: ItemKey[];
  onOpen: (key: ItemKey) => void;
  onClose: (key: ItemKey) => void;
  onSaveSession: (name: string) => void;
}) {
  return (
    <div className="writing-tabbar">
      <p className="writing-label">Open teksten</p>
      <div className="writing-tabs" aria-label="Open stukken">
        {view.tabs.map((key) => (
          <div
            className="writing-tab"
            data-active={key === view.active}
            key={key}
          >
            <button
              type="button"
              aria-pressed={key === view.active}
              data-close-menu
              onClick={() => onOpen(key)}
            >
              {title(key)}
              {dirty.includes(key) && (
                <span aria-label="Niet opgeslagen"> •</span>
              )}
            </button>
            <button
              type="button"
              aria-label={`Sluit tabblad ${title(key)}`}
              onClick={() => onClose(key)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {!!view.tabs.length && (
        <details className="writing-save-session">
          <summary>Sessie bewaren</summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = String(
                new FormData(e.currentTarget).get("name") ?? "",
              ).trim();
              if (!name) return;
              onSaveSession(name);
              e.currentTarget.reset();
              e.currentTarget.closest("details")!.open = false;
            }}
          >
            <label>
              Naam van de sessie
              <input name="name" required maxLength={80} />
            </label>
            <button type="submit">Bewaar tabbladen</button>
          </form>
        </details>
      )}
      <details className="writing-session-history">
        <summary>Bewaarde sessies ({sessions.length})</summary>
        <div className="writing-sessions">
          {sessions.map((s) => (
            <div className="writing-session" key={s.id}>
              <button
                type="button"
                data-close-menu
                onClick={() => onSession(s.id)}
              >
                {s.name}
                <span>{s.view.tabs.length}</span>
              </button>
              <button
                type="button"
                aria-label={`Verwijder sessie ${s.name}`}
                onClick={() => onRemoveSession(s.id)}
              >
                ×
              </button>
            </div>
          ))}
          {!sessions.length && (
            <p className="writing-hint">
              Bewaar je open teksten als sessie om later verder te gaan.
            </p>
          )}
        </div>
      </details>
    </div>
  );
}
