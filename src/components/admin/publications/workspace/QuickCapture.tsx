"use client";
import { useEffect, useRef, useState } from "react";
import { createWritingNote } from "@/app/admin/content/workspace-actions";
import type { WritingDocument } from "@/lib/admin/writing/model";

export default function QuickCapture({
  open,
  activeTitle,
  onCreated,
  onClose,
  onDirty,
}: {
  open: boolean;
  activeTitle: string | null;
  onCreated: (doc: WritingDocument, linked: boolean) => void;
  onClose: () => void;
  onDirty: (dirty: boolean) => void;
}) {
  const [title, setTitle] = useState(""),
    [body, setBody] = useState(""),
    [linked, setLinked] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (open) textarea.current?.focus();
  }, [open]);
  return (
    <form
      hidden={!open}
      className="writing-capture"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
          const result = await createWritingNote(title, body);
          if (result.ok) {
            onDirty(false);
            onCreated(result.value, linked);
          } else setError(result.message);
        } catch {
          setError(
            "Je notitie kon niet worden opgeslagen. Je tekst blijft staan.",
          );
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="writing-row">
        <h2>Idee vastleggen</h2>
        <button type="button" onClick={onClose} disabled={saving}>
          Sluiten
        </button>
      </div>
      <label>
        Titel <span className="writing-muted">· mag later</span>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            onDirty(!!(e.target.value || body));
          }}
          maxLength={500}
        />
      </label>
      <label>
        Gedachte
        <textarea
          ref={textarea}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            onDirty(!!(e.target.value || title));
          }}
          rows={4}
          maxLength={200000}
          required
        />
      </label>
      <div className="writing-row">
        {activeTitle && (
          <label className="writing-check">
            <input
              type="checkbox"
              checked={linked}
              onChange={(e) => setLinked(e.target.checked)}
            />
            Koppel aan {activeTitle}
          </label>
        )}
        <button className="member-button" disabled={saving} type="submit">
          {saving ? "Opslaan…" : "Bewaar in inbox"}
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <p className="writing-hint">
        Een privénotitie voor jouw schrijfwerk. Je publiceert hiermee niets.
      </p>
    </form>
  );
}
