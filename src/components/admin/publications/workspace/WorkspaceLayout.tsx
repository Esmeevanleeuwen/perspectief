"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import "./workspace.css";

/** Layout slots only; hiding the list keeps its search, page and scroll position. */
export default function WorkspaceLayout({
  mode,
  detail,
  documentKey,
  listKey,
  navigation,
  tools,
  list,
  document,
  reference,
  footer,
}: {
  mode: string;
  detail: boolean;
  documentKey: string;
  listKey: string;
  navigation: ReactNode;
  tools: ReactNode;
  list: ReactNode;
  document: ReactNode;
  reference?: ReactNode;
  footer: ReactNode;
}) {
  const listRef = useRef<HTMLElement>(null);
  const documentRef = useRef<HTMLElement>(null);
  const listPosition = useRef(0);
  const positions = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const pane = documentRef.current;
    if (pane) pane.scrollTop = positions.current.get(documentKey) ?? 0;
  }, [documentKey]);
  useLayoutEffect(() => {
    listPosition.current = 0;
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [listKey]);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = listPosition.current;
    // Move keyboard focus with the small-screen list/detail transition.
    if (
      detail &&
      documentKey !== "capture" &&
      list &&
      !list.getClientRects().length
    )
      documentRef.current
        ?.querySelector<HTMLButtonElement>(".writing-back")
        ?.focus({ preventScroll: true });
    if (!detail && documentRef.current?.contains(window.document.activeElement))
      list
        ?.querySelector<HTMLButtonElement>('button[aria-current="true"]')
        ?.focus({ preventScroll: true });
  }, [detail, mode, documentKey]);
  return (
    <div className="writing-workspace" data-mode={mode} data-detail={detail}>
      <div className="writing-panes">
        <section
          ref={listRef}
          className="writing-list"
          aria-label="Verzamelde stukken"
          onScroll={(event) => {
            if (event.currentTarget.getClientRects().length)
              listPosition.current = event.currentTarget.scrollTop;
          }}
        >
          <div className="writing-list-head">
            {navigation}
            {tools}
          </div>
          {list}
        </section>
        <section
          ref={documentRef}
          className="writing-document"
          aria-label="Schrijfvlak"
          onScroll={(event) => {
            if (event.currentTarget.getClientRects().length)
              positions.current.set(documentKey, event.currentTarget.scrollTop);
          }}
        >
          {document}
        </section>
        {reference && (
          <aside className="writing-reference" aria-label="Stuk ernaast">
            {reference}
          </aside>
        )}
      </div>
      <footer className="writing-footer">{footer}</footer>
    </div>
  );
}
