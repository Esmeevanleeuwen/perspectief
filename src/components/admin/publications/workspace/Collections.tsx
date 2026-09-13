"use client";
import { useState } from "react";
import WritingMenu from "./WritingMenu";
import type { WritingState } from "@/lib/admin/writing/model";

export default function Collections({
  state,
  onSelect,
  onCreate,
  onRename,
  onRemove,
}: {
  state: WritingState;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <WritingMenu
      className="writing-folders"
      ariaLabel="Kies een map"
      label={
        <>
          {state.view.collection === "all"
            ? "Alle teksten"
            : state.view.collection === "inbox"
              ? "Inbox"
              : (state.collections.find((c) => c.id === state.view.collection)
                  ?.name ?? "Alle teksten")}
          <span aria-hidden="true">⌄</span>
        </>
      }
    >
      <p className="writing-label">Mappen</p>
      <nav className="writing-collections" aria-label="Mappen">
        <button
          type="button"
          aria-pressed={state.view.collection === "all"}
          data-close-menu
          onClick={() => onSelect("all")}
        >
          Alle teksten
        </button>
        <button
          type="button"
          aria-pressed={state.view.collection === "inbox"}
          data-close-menu
          onClick={() => onSelect("inbox")}
        >
          Inbox <span>Nog niet ingedeeld</span>
        </button>
        {state.collections.map((c) => (
          <div className="writing-collection" key={c.id}>
            <button
              type="button"
              aria-pressed={state.view.collection === c.id}
              data-close-menu
              onClick={() => onSelect(c.id)}
            >
              {c.name}
              <span>{c.items.length}</span>
            </button>
            <details>
              <summary aria-label={`Beheer map ${c.name}`}>⋯</summary>
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
                  Map opheffen
                </button>
                <small>De stukken blijven bewaard.</small>
              </form>
            </details>
          </div>
        ))}
      </nav>
      <details className="writing-add">
        <summary>+ Nieuwe map</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onCreate(name.trim());
            setName("");
            e.currentTarget
              .closest("details.writing-popup")!
              .removeAttribute("open");
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
    </WritingMenu>
  );
}
