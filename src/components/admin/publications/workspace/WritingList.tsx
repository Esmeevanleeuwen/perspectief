"use client";
import {
  optionLabel,
  publicationTypes,
  publicationStatuses,
} from "@/lib/admin/publications/model";
import {
  PAGE_SIZE,
  type ItemKey,
  type WritingPage,
  type WritingView,
} from "@/lib/admin/writing/model";

export default function WritingList({
  view,
  result,
  loading,
  error,
  dirty,
  onFilters,
  onOpen,
  onReference,
  onPage,
  onRetry,
}: {
  view: WritingView;
  result: WritingPage;
  loading: boolean;
  error: string;
  dirty: ItemKey[];
  onFilters: (value: Partial<WritingView>) => void;
  onOpen: (key: ItemKey) => void;
  onReference: (key: ItemKey) => void;
  onPage: (page: number) => void;
  onRetry: () => void;
}) {
  return (
    <>
      <div className="writing-search">
        <label>
          Zoek in je verzameling
          <input
            type="search"
            value={view.query}
            maxLength={100}
            placeholder="Titel of tekst…"
            onChange={(e) => onFilters({ query: e.target.value })}
          />
        </label>
        <div className="writing-filter-row">
          <label>
            Soort
            <select
              value={view.type}
              onChange={(e) => onFilters({ type: e.target.value })}
            >
              <option value="">Alle soorten</option>
              {publicationTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
              <option value="note">Notitie</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={view.status}
              onChange={(e) => onFilters({ status: e.target.value })}
            >
              <option value="">Alle statussen</option>
              {publicationStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <details className="writing-placement">
          <summary>
            Homepage-instelling{view.placement ? " · actief" : ""}
          </summary>
          <label>
            Uitlichten
            <select
              value={view.placement}
              onChange={(e) => onFilters({ placement: e.target.value })}
            >
              <option value="">Alles</option>
              <option value="featured">Uitgelicht</option>
              <option value="unfeatured">Niet uitgelicht</option>
            </select>
          </label>
        </details>
      </div>
      <div className="writing-list-count" role="status">
        {loading
          ? "Laden…"
          : `${result.total} ${result.total === 1 ? "stuk" : "stukken"}`}
      </div>
      {error ? (
        <div className="writing-empty" role="alert">
          {error}
          <button type="button" onClick={onRetry}>
            Opnieuw laden
          </button>
        </div>
      ) : (
        <div
          aria-busy={loading}
          className={loading ? "writing-results is-loading" : "writing-results"}
        >
          {result.items.map((item) => (
            <article
              className="writing-list-item"
              data-active={item.key === view.active}
              key={item.key}
            >
              <button
                type="button"
                className="writing-item-open"
                onClick={() => onOpen(item.key)}
              >
                <strong>
                  {item.title}
                  {dirty.includes(item.key) && " •"}
                </strong>
                {item.summary && <span>{item.summary}</span>}
              </button>
              <div className="writing-item-meta">
                <span>
                  {item.type === "note"
                    ? "Notitie"
                    : optionLabel(publicationTypes, item.type)}{" "}
                  · {optionLabel(publicationStatuses, item.status)}
                </span>
                {view.active && view.active !== item.key && (
                  <button
                    type="button"
                    aria-label={`Open ${item.title} ernaast`}
                    onClick={() => onReference(item.key)}
                  >
                    Ernaast
                  </button>
                )}
              </div>
            </article>
          ))}
          {!result.items.length && !loading && (
            <p className="writing-empty">Geen stukken in deze selectie.</p>
          )}
        </div>
      )}
      {result.total > PAGE_SIZE && (
        <nav className="writing-pagination" aria-label="Pagina's met stukken">
          <button
            type="button"
            disabled={loading || result.page <= 1}
            onClick={() => onPage(result.page - 1)}
          >
            Vorige
          </button>
          <span>
            {result.page} / {Math.ceil(result.total / PAGE_SIZE)}
          </span>
          <button
            type="button"
            disabled={loading || result.page * PAGE_SIZE >= result.total}
            onClick={() => onPage(result.page + 1)}
          >
            Volgende
          </button>
        </nav>
      )}
    </>
  );
}
