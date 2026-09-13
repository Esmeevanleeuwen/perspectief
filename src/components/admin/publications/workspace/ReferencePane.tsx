"use client";
import type { WritingDocument } from "@/lib/admin/writing/model";
export default function ReferencePane({
  document,
  loading,
  error,
  linked,
  isLatest,
  onClose,
  onConnect,
  onSwap,
  onUseLatest,
}: {
  document: WritingDocument | null;
  loading: boolean;
  error: string;
  linked: boolean;
  isLatest: boolean;
  onClose: () => void;
  onConnect: () => void;
  onSwap: () => void;
  onUseLatest: () => void;
}) {
  return (
    <>
      <div className="writing-row">
        <span className="writing-muted">
          {isLatest ? "Nieuwste opgeslagen versie" : "Ernaast"}
        </span>
        <button type="button" onClick={onClose}>
          Sluiten
        </button>
      </div>
      {loading && <p role="status">Laden…</p>}
      {error && <p role="alert">{error}</p>}
      {document && (
        <>
          <h2>{document.title}</h2>
          {document.summary && <p>{document.summary}</p>}
          {document.sections.map((s) => (
            <section key={s.id}>
              {s.title && <h3>{s.title}</h3>}
              <p>{s.body}</p>
              {Array.isArray(s.data?.points) && (
                <ul>
                  {s.data.points
                    .filter((p): p is string => typeof p === "string")
                    .map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                </ul>
              )}
            </section>
          ))}
          {isLatest ? (
            <button type="button" onClick={onUseLatest}>
              Verder met deze opgeslagen versie
            </button>
          ) : (
            <div className="writing-row">
              <button type="button" onClick={onSwap}>
                Wissel schrijfvlak
              </button>
              <button type="button" disabled={linked} onClick={onConnect}>
                {linked ? "Verbonden" : "Verbind stukken"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
