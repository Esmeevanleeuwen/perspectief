"use client";
import { useEffect, useRef, type KeyboardEvent } from "react";
import type { ItemKey, WritingView } from "@/lib/admin/writing/model";
import "./document-tabs.css";

type Props = {
  view: WritingView;
  title: (key: ItemKey) => string;
  dirty: ItemKey[];
  onOpen: (key: ItemKey) => void;
  onClose: (key: ItemKey) => void;
  onNew: () => void;
  capture: boolean;
  captureDirty: boolean;
};

/** These tabs only select documents. They never save, delete or copy a text. */
export default function OpenDocumentTabs({ view, title, dirty, onOpen, onClose, onNew, capture, captureDirty }: Props) {
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const selected = list.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    selected?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [view.active, capture]);

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[next].focus({ preventScroll: true });
    buttons[next].click();
  }
  function close(key: ItemKey) {
    const index = view.tabs.indexOf(key);
    const remaining = view.tabs.filter(tab => tab !== key);
    const next = view.active === key ? remaining[Math.min(index, remaining.length - 1)] : view.active;
    onClose(key);
    requestAnimationFrame(() => {
      if (next) document.getElementById(`writing-tab-${next}`)?.focus({ preventScroll: true });
      else list.current?.parentElement?.querySelector<HTMLButtonElement>(".writing-tab-new")?.focus();
    });
  }

  return (
    <div className="writing-document-tabs">
      <div ref={list} role="tablist" aria-label="Open teksten" className="writing-document-tablist" onKeyDown={move}>
        {view.tabs.map((key, index) => {
          const selected = !capture && key === view.active;
          const label = title(key);
          const changed = dirty.includes(key);
          return <div key={key} className="writing-document-tab" role="presentation" data-active={selected}>
            <button type="button" role="tab" id={`writing-tab-${key}`} aria-controls="writing-active-document"
              aria-selected={selected} tabIndex={selected || (!capture && !view.active && index === 0) ? 0 : -1}
              aria-label={`${label}${changed ? ", niet opgeslagen" : ""}`} title={label}
              onClick={() => onOpen(key)} onKeyDown={event => {
                if (event.key === "Delete") { event.preventDefault(); close(key); }
              }}>
              <span className="writing-document-tab-title">{label}</span>
              {changed && <span aria-hidden="true" className="writing-tab-dirty">•</span>}
            </button>
            <button type="button" tabIndex={-1} className="writing-tab-close" aria-label={`Sluit tabblad ${label}`} title="Tabblad sluiten (Delete)" onClick={() => close(key)}>×</button>
          </div>;
        })}
        {(capture || captureDirty) && <button type="button" role="tab" id="writing-tab-capture" aria-controls="writing-active-document" aria-selected={capture} tabIndex={capture ? 0 : -1} onClick={onNew}>Nieuwe notitie{captureDirty ? " •" : ""}</button>}
        {!view.tabs.length && !capture && !captureDirty && <span className="writing-tabs-empty">Open een tekst uit de lijst</span>}
      </div>
      <button type="button" className="writing-tab-new" aria-label="Nieuwe privénotitie" title="Nieuwe privénotitie" onClick={onNew}>＋</button>
    </div>
  );
}
