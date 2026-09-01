import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import styles from "./page.module.css";

type SearchResult = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content_type: string;
  eyebrow: string | null;
  matched_section: string | null;
  excerpt: string | null;
  match_count: number;
  rank: number;
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

function resultHref(result: SearchResult) {
  if (result.content_type === "research") {
    return `/onderzoek/${result.slug}`;
  }

  return `/artikelen/${result.slug}`;
}

function typeLabel(type: string) {
  if (type === "research") {
    return "ONDERZOEK";
  }

  if (type === "analysis") {
    return "ANALYSE";
  }

  if (type === "case") {
    return "CASUS";
  }

  return "ARTIKEL";
}

function HighlightedExcerpt({
  text,
}: {
  text: string;
}) {
  const parts = text.split(/(<<<.*?>>>)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (
          part.startsWith("<<<") &&
          part.endsWith(">>>")
        ) {
          return (
            <mark key={index}>
              {part.slice(3, -3)}
            </mark>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const query = (params.q ?? "").trim();

  const filter =
    params.type === "article" ||
    params.type === "research"
      ? params.type
      : "all";

  let results: SearchResult[] = [];

  if (query.length > 0) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "search_meridian",
      {
        search_query: query,
        content_filter: filter,
      }
    );

    if (error) {
      console.error(
        "Meridian search error:",
        error
      );
    } else {
      results = (data ?? []) as SearchResult[];
    }
  }

  const articleCount = results.filter(
    (result) =>
      result.content_type !== "research"
  ).length;

  const researchCount = results.filter(
    (result) =>
      result.content_type === "research"
  ).length;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>
          MERIDIAN / ZOEKEN
        </p>

        <h1>
          Doorzoek de
          <br />
          kennisstructuur.
        </h1>

        <p className={styles.intro}>
          Zoek niet alleen naar titels. Meridian
          doorzoekt ook de volledige tekst van
          artikelen en onderzoeken.
        </p>

        <form
          action="/zoeken"
          method="get"
          className={styles.searchForm}
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Zoek een woord, begrip of onderwerp"
            autoFocus
          />

          <input
            type="hidden"
            name="type"
            value={filter}
          />

          <button
            type="submit"
            aria-label="Zoeken"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="10.5"
                cy="10.5"
                r="6.3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />

              <path
                d="M15.2 15.2L20.5 20.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </form>
      </section>

      {query && (
        <section className={styles.results}>
          <div className={styles.resultsTop}>
            <div>
              <p className={styles.resultLabel}>
                Resultaten voor
              </p>

              <h2>“{query}”</h2>
            </div>

            <span className={styles.total}>
              {results.length}{" "}
              {results.length === 1
                ? "resultaat"
                : "resultaten"}
            </span>
          </div>

          <nav
            className={styles.filters}
            aria-label="Zoekfilters"
          >
            <Link
              href={`/zoeken?q=${encodeURIComponent(
                query
              )}&type=all`}
              className={
                filter === "all"
                  ? styles.activeFilter
                  : undefined
              }
            >
              Alles
              <span>{results.length}</span>
            </Link>

            <Link
              href={`/zoeken?q=${encodeURIComponent(
                query
              )}&type=article`}
              className={
                filter === "article"
                  ? styles.activeFilter
                  : undefined
              }
            >
              Artikelen
              {filter === "all" && (
                <span>{articleCount}</span>
              )}
            </Link>

            <Link
              href={`/zoeken?q=${encodeURIComponent(
                query
              )}&type=research`}
              className={
                filter === "research"
                  ? styles.activeFilter
                  : undefined
              }
            >
              Onderzoeken
              {filter === "all" && (
                <span>{researchCount}</span>
              )}
            </Link>
          </nav>

          {results.length === 0 ? (
            <div className={styles.empty}>
              <span>Geen resultaten</span>

              <h3>
                Dit begrip komt nog niet voor in
                gepubliceerde Meridian-content.
              </h3>

              <p>
                Probeer een ander woord of een bredere
                zoekterm.
              </p>
            </div>
          ) : (
            <div className={styles.resultList}>
              {results.map((result, index) => (
                <article
                  className={styles.result}
                  key={result.id}
                >
                  <span className={styles.number}>
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <div className={styles.resultBody}>
                    <div className={styles.resultMeta}>
                      <span>
                        {result.eyebrow ??
                          typeLabel(
                            result.content_type
                          )}
                      </span>

                      {result.matched_section && (
                        <>
                          <i />
                          <span>
                            Gevonden in{" "}
                            {result.matched_section}
                          </span>
                        </>
                      )}
                    </div>

                    <Link
                      href={resultHref(result)}
                      className={styles.resultTitle}
                    >
                      <h3>{result.title}</h3>
                    </Link>

                    {result.excerpt && (
                      <p className={styles.excerpt}>
                        <HighlightedExcerpt
                          text={result.excerpt}
                        />
                      </p>
                    )}

                    <div className={styles.resultFooter}>
                      <span>
                        {result.match_count}{" "}
                        {result.match_count === 1
                          ? "overeenkomst"
                          : "overeenkomsten"}
                      </span>

                      <Link
                        href={resultHref(result)}
                      >
                        {result.content_type ===
                        "research"
                          ? "Onderzoek openen"
                          : "Lees publicatie"}

                        <b>→</b>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {!query && (
        <section className={styles.start}>
          <span className={styles.startLine} />

          <div>
            <p>Je kunt bijvoorbeeld zoeken op</p>

            <div className={styles.examples}>
              <Link href="/zoeken?q=macht">
                macht
              </Link>

              <Link href="/zoeken?q=arbeid">
                arbeid
              </Link>

              <Link href="/zoeken?q=identiteit">
                identiteit
              </Link>

              <Link href="/zoeken?q=risico">
                risico
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}