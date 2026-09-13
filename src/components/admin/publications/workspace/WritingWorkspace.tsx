"use client";
import { useEffect, useState } from "react";
import {
  loadWritingDocument,
  loadWritingTitles,
} from "@/app/admin/content/workspace-actions";
import {
  closeItem,
  linkedKeys,
  openItem,
  type ItemKey,
  type WritingDocument,
  type WritingPage,
  type WritingState,
  type WritingView,
} from "@/lib/admin/writing/model";
import WorkspaceLayout from "./WorkspaceLayout";
import Collections from "./Collections";
import DocumentTabs from "./DocumentTabs";
import WritingList from "./WritingList";
import DocumentEditor from "./DocumentEditor";
import ReferencePane from "./ReferencePane";
import QuickCapture from "./QuickCapture";
import { useWritingSpace } from "./useWritingSpace";
import { useWritingDocuments } from "./useWritingDocuments";
import { useWritingSearch } from "./useWritingSearch";

export default function WritingWorkspace({
  initialState,
  initialVersion,
  initialPage,
  initialDocuments,
}: {
  initialState: WritingState;
  initialVersion: number;
  initialPage: WritingPage;
  initialDocuments: WritingDocument[];
}) {
  const space = useWritingSpace(initialState, initialVersion),
    { state, update } = space;
  const docs = useWritingDocuments(initialDocuments),
    search = useWritingSearch(state, initialPage);
  const [capture, setCapture] = useState(false),
    [captureDirty, setCaptureDirty] = useState(false),
    [captureKey, setCaptureKey] = useState(0),
    [message, setMessage] = useState("");
  const [titles, setTitles] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialPage.items.map((item) => [item.key, item.title])),
  );
  const [latest, setLatest] = useState<{
    key: ItemKey;
    document: WritingDocument | null;
    error: string;
    loading: boolean;
  } | null>(null);
  const active = state.view.active,
    reference = state.view.reference;
  const activeDocument = active ? docs.documents[active] : undefined;
  const title = (key: ItemKey) =>
    docs.documents[key]?.title ??
    search.result.items.find((item) => item.key === key)?.title ??
    titles[key] ??
    "Titel laden…";
  const { ensure } = docs;
  useEffect(() => {
    if (active) void ensure(active);
    if (reference) void ensure(reference);
  }, [active, reference, ensure]);
  // Only fetch labels for tabs and links; document bodies load when opened.
  const missingTitles = JSON.stringify(
    [
      ...new Set([
        ...state.view.tabs,
        ...(active ? linkedKeys(state, active) : []),
      ]),
    ]
      .filter((key) => !titles[key] && !docs.documents[key])
      .slice(0, 200),
  );
  useEffect(() => {
    const keys = JSON.parse(missingTitles) as ItemKey[];
    if (!keys.length) return;
    let cancelled = false;
    void loadWritingTitles(keys)
      .then((result) => {
        if (!cancelled && result.ok)
          setTitles((current) => ({
            ...current,
            ...Object.fromEntries(
              keys.map((key) => [
                key,
                result.value[key] ?? "Stuk niet beschikbaar",
              ]),
            ),
          }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [missingTitles]);
  const hasUnsaved = docs.dirty.length > 0 || space.pending || captureDirty;
  useEffect(() => {
    if (!hasUnsaved) return;
    const before = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const leave = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (
        !anchor ||
        anchor.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        (anchor.hash && anchor.pathname === location.pathname)
      )
        return;
      if (
        !window.confirm(
          "Er zijn nog niet opgeslagen wijzigingen. Wil je deze pagina verlaten?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", before);
    document.addEventListener("click", leave, true);
    return () => {
      window.removeEventListener("beforeunload", before);
      document.removeEventListener("click", leave, true);
    };
  }, [hasUnsaved]);
  function changeView(change: Partial<WritingView>) {
    update((s) => ({ ...s, view: { ...s.view, ...change } }));
    setLatest(null);
  }
  function open(key: ItemKey) {
    if (state.view.tabs.length >= 50 && !state.view.tabs.includes(key)) {
      setMessage(
        "Sluit een tabblad voordat je een nieuw stuk opent (maximaal 50).",
      );
      return;
    }
    update((s) => ({ ...s, view: openItem(s.view, key) }));
    setLatest(null);
  }
  function showReference(key: ItemKey) {
    changeView({ reference: key, mode: "reference" });
  }
  function connect(key: ItemKey) {
    if (!active || key === active || linkedKeys(state, active).includes(key))
      return;
    update((s) => ({ ...s, links: [...s.links, [active, key]] }));
    setMessage("Verband gelegd. Je ziet het bij beide stukken.");
  }
  async function save() {
    if (!active) return;
    const saved = await docs.save(active);
    if (saved) {
      search.refresh();
      setMessage("Tekst opgeslagen.");
    }
  }
  async function showLatest() {
    if (!active) return;
    const key = active;
    setLatest({ key, document: null, error: "", loading: true });
    update((s) => ({ ...s, view: { ...s.view, mode: "reference" } }));
    try {
      const result = await loadWritingDocument(key);
      setLatest((current) =>
        current?.key === key
          ? {
              key,
              document: result.ok ? result.value : null,
              error: result.ok ? "" : result.message,
              loading: false,
            }
          : current,
      );
    } catch {
      setLatest((current) =>
        current?.key === key
          ? { key, document: null, error: "Laden lukte niet.", loading: false }
          : current,
      );
    }
  }
  const referenceDocument = latest
    ? latest.document
    : ((reference ? docs.documents[reference] : undefined) ?? null);
  const referenceError =
    latest?.error ?? (reference ? docs.errors[reference]?.message : "") ?? "";
  const shownPage = {
    ...search.result,
    items: search.result.items.map((item) =>
      docs.dirty.includes(item.key) && docs.documents[item.key]
        ? { ...item, title: docs.documents[item.key].title }
        : item,
    ),
  };
  return (
    <div
      onKeyDown={(event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "s"
        ) {
          event.preventDefault();
          void save();
        }
      }}
    >
      <QuickCapture
        key={captureKey}
        open={capture}
        activeTitle={active ? title(active) : null}
        onDirty={setCaptureDirty}
        onClose={() => setCapture(false)}
        onCreated={(document, linked) => {
          docs.put(document);
          update((s) => ({
            ...s,
            view: {
              ...openItem(s.view, document.key),
              collection: "inbox",
              query: "",
              type: "",
              status: "",
              placement: "",
              mode: "overview",
              reference: null,
            },
            links:
              linked && s.view.active
                ? [...s.links, [s.view.active, document.key]]
                : s.links,
          }));
          setCapture(false);
          setCaptureKey((value) => value + 1);
          search.refresh();
          setMessage("Je privénotitie is opgeslagen in de inbox.");
        }}
      />
      <WorkspaceLayout
        mode={state.view.mode}
        toolbar={
          <div className="writing-toolbar">
            <div className="writing-view-controls">
              <button
                type="button"
                aria-pressed={state.view.mode === "overview"}
                onClick={() =>
                  changeView({ mode: "overview", reference: null })
                }
              >
                Overzicht
              </button>
              <button
                type="button"
                aria-pressed={state.view.mode === "focus"}
                onClick={() =>
                  changeView({
                    mode: state.view.mode === "focus" ? "overview" : "focus",
                    reference: null,
                  })
                }
              >
                Focus
              </button>
            </div>
            <button
              type="button"
              className="member-button"
              aria-expanded={capture}
              onClick={() => setCapture(!capture)}
            >
              + Idee vastleggen
            </button>
          </div>
        }
        navigation={
          <Collections
            state={state}
            onSelect={(collection) =>
              changeView({
                collection,
                query: "",
                mode: "overview",
                reference: null,
              })
            }
            onCreate={(name) => {
              if (state.collections.length >= 100) {
                setMessage("Je kunt maximaal 100 collecties bewaren.");
                return;
              }
              const id = crypto.randomUUID();
              update((s) => ({
                ...s,
                collections: [...s.collections, { id, name, items: [] }],
                view: {
                  ...s.view,
                  collection: id,
                  query: "",
                  type: "",
                  status: "",
                  placement: "",
                  mode: "overview",
                },
              }));
            }}
            onRename={(id, name) => {
              if (name.trim())
                update((s) => ({
                  ...s,
                  collections: s.collections.map((c) =>
                    c.id === id ? { ...c, name: name.trim() } : c,
                  ),
                }));
            }}
            onRemove={(id) => {
              update((s) => ({
                ...s,
                collections: s.collections.filter((c) => c.id !== id),
                view:
                  s.view.collection === id
                    ? { ...s.view, collection: "all" }
                    : s.view,
              }));
              setMessage("Collectie opgeheven. Alle stukken blijven bewaard.");
            }}
            onSession={(id) => {
              const session = state.sessions.find((s) => s.id === id);
              if (!session) return;
              update((s) => ({
                ...s,
                view: {
                  ...session.view,
                  tabs: [...session.view.tabs],
                  collection: [
                    "all",
                    "inbox",
                    ...s.collections.map((c) => c.id),
                  ].includes(session.view.collection)
                    ? session.view.collection
                    : "all",
                },
              }));
              setLatest(null);
              setMessage(`Sessie ‘${session.name}’ heropend.`);
            }}
            onRemoveSession={(id) =>
              update((s) => ({
                ...s,
                sessions: s.sessions.filter((session) => session.id !== id),
              }))
            }
          />
        }
        tabs={
          <DocumentTabs
            view={state.view}
            title={title}
            dirty={docs.dirty}
            onOpen={open}
            onClose={(key) => {
              update((s) => ({ ...s, view: closeItem(s.view, key) }));
              setLatest(null);
            }}
            onSaveSession={(name) => {
              if (state.sessions.length >= 100) {
                setMessage("Je kunt maximaal 100 sessies bewaren.");
                return;
              }
              update((s) => ({
                ...s,
                sessions: [
                  ...s.sessions,
                  {
                    id: crypto.randomUUID(),
                    name,
                    view: { ...s.view, tabs: [...s.view.tabs] },
                  },
                ],
              }));
              setMessage("Sessie wordt onder je account bewaard.");
            }}
          />
        }
        list={
          <WritingList
            view={state.view}
            result={shownPage}
            loading={search.loading}
            error={search.error}
            dirty={docs.dirty}
            onFilters={changeView}
            onOpen={open}
            onReference={showReference}
            onPage={search.onPage}
            onRetry={search.refresh}
          />
        }
        document={
          activeDocument ? (
            <DocumentEditor
              key={activeDocument.key}
              document={activeDocument}
              state={state}
              dirty={docs.dirty.includes(activeDocument.key)}
              saving={docs.saving.includes(activeDocument.key)}
              error={docs.errors[activeDocument.key]?.message ?? ""}
              conflict={!!docs.errors[activeDocument.key]?.conflict}
              title={title}
              onChange={docs.edit}
              onSave={() => void save()}
              onMembership={(id, included) => {
                update((s) => ({
                  ...s,
                  collections: s.collections.map((c) =>
                    c.id === id
                      ? {
                          ...c,
                          items: included
                            ? [...new Set([...c.items, activeDocument.key])]
                            : c.items.filter(
                                (key) => key !== activeDocument.key,
                              ),
                        }
                      : c,
                  ),
                }));
              }}
              onConnect={connect}
              onUnlink={(key) =>
                update((s) => ({
                  ...s,
                  links: s.links.filter(
                    ([a, b]) =>
                      !(
                        (a === active && b === key) ||
                        (b === active && a === key)
                      ),
                  ),
                }))
              }
              onReference={showReference}
              onLatest={() => void showLatest()}
            />
          ) : (
            <div className="writing-empty">
              {active
                ? docs.errors[active]?.message || "Stuk laden…"
                : "Open een stuk uit je verzameling of leg een idee vast."}
              {active && docs.errors[active] && (
                <button type="button" onClick={() => void ensure(active)}>
                  Opnieuw laden
                </button>
              )}
            </div>
          )
        }
        reference={
          state.view.mode === "reference" ? (
            <ReferencePane
              document={referenceDocument}
              loading={
                latest?.loading ??
                !!(reference && docs.loading.includes(reference))
              }
              error={referenceError}
              linked={
                !!(
                  active &&
                  reference &&
                  linkedKeys(state, active).includes(reference)
                )
              }
              isLatest={!!latest}
              onClose={() => changeView({ mode: "overview", reference: null })}
              onConnect={() => {
                if (reference) connect(reference);
              }}
              onSwap={() => {
                if (reference && active)
                  update((s) => ({
                    ...s,
                    view: {
                      ...openItem(s.view, reference),
                      reference: active,
                      mode: "reference",
                    },
                  }));
              }}
              onUseLatest={() => {
                if (
                  latest?.document &&
                  window.confirm(
                    "Je niet opgeslagen tekst vervangen door de nieuwste opgeslagen versie?",
                  )
                ) {
                  docs.replace(latest.document);
                  changeView({ mode: "overview", reference: null });
                  search.refresh();
                }
              }}
            />
          ) : null
        }
        footer={
          <>
            <span role="status">
              {message ||
                "Jouw collecties en sessies worden onder je account bewaard."}
            </span>
            {docs.dirty.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  update((s) => ({
                    ...s,
                    view: {
                      ...s.view,
                      tabs: [...new Set([...s.view.tabs, ...docs.dirty])],
                      active: docs.dirty[0],
                    },
                  }))
                }
              >
                Niet opgeslagen: {docs.dirty.length}
              </button>
            )}
            <span role={space.error ? "alert" : "status"}>
              {space.error ||
                (space.saving
                  ? "Indeling opslaan…"
                  : space.pending
                    ? "Indeling nog niet opgeslagen"
                    : "Indeling opgeslagen")}
              {space.error && (
                <button type="button" onClick={space.retry}>
                  Opnieuw proberen
                </button>
              )}
            </span>
          </>
        }
      />
    </div>
  );
}
