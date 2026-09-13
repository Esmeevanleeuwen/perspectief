"use client";
import type { ItemKey, WritingView } from "@/lib/admin/writing/model";

export default function DocumentTabs({
  view,
  title,
  dirty,
  onOpen,
  onClose,
  onSaveSession,
}: {
  view: WritingView;
  title: (key: ItemKey) => string;
  dirty: ItemKey[];
  onOpen: (key: ItemKey) => void;
  onClose: (key: ItemKey) => void;
  onSaveSession: (name: string) => void;
}) {
  return (
    <div className="writing-tabbar">
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
    </div>
  );
}
