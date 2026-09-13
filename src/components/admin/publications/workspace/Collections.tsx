"use client";
import { useState } from "react";
import type { WritingState } from "@/lib/admin/writing/model";

export default function Collections({
  state,
  onSelect,
  onCreate,
  onRename,
  onRemove,
  onSession,
  onRemoveSession,
}: {
  state: WritingState;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onSession: (id: string) => void;
  onRemoveSession: (id: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <>
      <p className="writing-label">Mijn schrijfwerk</p>
      <nav className="writing-collections" aria-label="Collecties">
        <button
          type="button"
          aria-pressed={state.view.collection === "all"}
          onClick={() => onSelect("all")}
        >
          Alles
        </button>
        <button
          type="button"
          aria-pressed={state.view.collection === "inbox"}
          onClick={() => onSelect("inbox")}
        >
          Inbox <span>Nog niet ingedeeld</span>
        </button>
        {state.collections.map((c) => (
          <div className="writing-collection" key={c.id}>
            <button
              type="button"
              aria-pressed={state.view.collection === c.id}
              onClick={() => onSelect(c.id)}
            >
              {c.name}
              <span>{c.items.length}</span>
            </button>
            <details>
              <summary aria-label={`Beheer collectie ${c.name}`}>⋯</summary>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onRename(
                    c.id,
                    String(new FormData(e.currentTarget).get("name") ?? ""),
                  );
                  e.currentTarget.closest("details")!.open = false;
                }}
              >
                <label>
                  Naam
                  <input
                    name="name"
                    key={c.name}
                    defaultValue={c.name}
                    maxLength={80}
                    required
                  />
                </label>
                <button type="submit">Hernoemen</button>
                <button type="button" onClick={() => onRemove(c.id)}>
                  Collectie opheffen
                </button>
                <small>De stukken blijven bewaard.</small>
              </form>
            </details>
          </div>
        ))}
      </nav>
      <details className="writing-add">
        <summary>+ Nieuwe collectie</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onCreate(name.trim());
            setName("");
            e.currentTarget.closest("details")!.open = false;
          }}
        >
          <label>
            Naam
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
            />
          </label>
          <button type="submit">Aanmaken</button>
        </form>
      </details>
      <p className="writing-label writing-separated">Bewaarde sessies</p>
      <div className="writing-sessions">
        {state.sessions.map((s) => (
          <div className="writing-session" key={s.id}>
            <button type="button" onClick={() => onSession(s.id)}>
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
      </div>
      {!state.sessions.length && (
        <p className="writing-hint">
          Bewaar je open tabbladen als sessie om later verder te gaan.
        </p>
      )}
    </>
  );
}
