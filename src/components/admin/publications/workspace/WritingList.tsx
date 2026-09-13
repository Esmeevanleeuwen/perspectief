"use client";
import WritingMenu from "./WritingMenu";
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

const dateFormat = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Amsterdam",
});

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
          <span className="writing-visually-hidden">
            Zoek in je verzameling
          </span>
          <input
            type="search"
            value={view.query}
            maxLength={100}
            placeholder="Zoeken"
            onChange={(e) => onFilters({ query: e.target.value })}
          />
        </label>
        <details className="writing-filters">
          <summary>
            Filters
            {[view.type, view.status, view.placement].some(Boolean)
              ? " · actief"
              : ""}
          </summary>
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
          <div className="writing-placement">
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
          </div>
          {[view.type, view.status, view.placement].some(Boolean) && (
            <button
              type="button"
              onClick={() => onFilters({ type: "", status: "", placement: "" })}
            >
              Filters wissen
            </button>
          )}
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
                aria-label={`${item.title}${dirty.includes(item.key) ? " •" : ""}`}
                aria-current={item.key === view.active ? "true" : undefined}
                onClick={() => onOpen(item.key)}
              >
                <strong>
                  {item.title}
                  {dirty.includes(item.key) && " •"}
                </strong>
                <time dateTime={item.updatedAt}>
                  {dateFormat.format(new Date(item.updatedAt))}
                </time>
                <span>{item.summary || "Nog geen tekst"}</span>
              </button>
              <div className="writing-item-meta">
                {view.active && view.active !== item.key && (
                  <WritingMenu
                    className="writing-item-menu"
                    label="⋯"
                    ariaLabel={`Opties voor ${item.title}`}
                  >
                    <span className="writing-muted">
                      {item.type === "note"
                        ? "Notitie"
                        : optionLabel(publicationTypes, item.type)}{" "}
                      · {optionLabel(publicationStatuses, item.status)}
                    </span>
                    <button
                      type="button"
                      data-close-menu
                      aria-label={`Open ${item.title} ernaast`}
                      onClick={() => onReference(item.key)}
                    >
                      Ernaast openen
                    </button>
                  </WritingMenu>
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
