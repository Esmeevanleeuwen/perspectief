"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ARTICLE_IMAGE_BUCKET, prepareArticleImage } from "@/lib/admin/article-image";
import { safeHref } from "@/lib/publishing/model";
import "./article-image.css";

type Props = {
  value?: string;
  defaultValue?: string;
  name?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onBusyChange?: (busy: boolean) => void;
};

export default function ArticleImageField({ value, defaultValue = "", name, disabled = false, onChange, onBusyChange }: Props) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const mounted = useRef(true);
  const id = useId();
  const url = value ?? localValue;
  const preview = safeHref(url);

  useEffect(() => {
    mounted.current = true;
    const form = root.current?.closest("form");
    const preventEarlySubmit = (event: Event) => {
      if (!busyRef.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setError("De afbeelding wordt nog geüpload. Sla daarna je artikel op.");
    };
    const warn = (event: BeforeUnloadEvent) => {
      if (busyRef.current) { event.preventDefault(); event.returnValue = ""; }
    };
    form?.addEventListener("submit", preventEarlySubmit, true);
    window.addEventListener("beforeunload", warn);
    return () => {
      mounted.current = false;
      form?.removeEventListener("submit", preventEarlySubmit, true);
      window.removeEventListener("beforeunload", warn);
    };
  }, []);

  function change(next: string) {
    if (value === undefined) setLocalValue(next);
    onChange?.(next);
  }

  async function upload(file: File) {
    if (busyRef.current || disabled) return;
    busyRef.current = true;
    setBusy(true); setError(""); setNotice(""); onBusyChange?.(true);
    try {
      const prepared = await prepareArticleImage(file);
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) throw new Error("Je sessie is verlopen. Log opnieuw in om te uploaden.");
      const path = `${data.user.id}/${crypto.randomUUID()}.${prepared.format.extension}`;
      const { error: uploadError } = await supabase.storage.from(ARTICLE_IMAGE_BUCKET).upload(path, prepared.blob, {
        contentType: prepared.format.mime, cacheControl: "31536000", upsert: false,
      });
      if (uploadError) throw new Error("Uploaden is niet gelukt. Controleer je verbinding en of je eigenaar of redacteur bent, en probeer opnieuw.");
      const { data: stored } = supabase.storage.from(ARTICLE_IMAGE_BUCKET).getPublicUrl(path);
      if (mounted.current) {
        change(stored.publicUrl);
        setNotice("Afbeelding geüpload. Sla je concept op of publiceer om hem aan het artikel te koppelen.");
      }
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : "Uploaden is niet gelukt. Probeer opnieuw.");
    } finally {
      busyRef.current = false;
      if (mounted.current) { setBusy(false); onBusyChange?.(false); }
    }
  }

  return <div className="article-image-field" ref={root} aria-busy={busy}>
    <label htmlFor={id} className="article-image-label">Afbeelding vanaf je apparaat</label>
    <input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
      disabled={disabled || busy} aria-describedby={`${id}-help`} onChange={event => {
        const file = event.currentTarget.files?.[0]; event.currentTarget.value = "";
        if (file) void upload(file);
      }} />
    <p id={`${id}-help`} className="article-image-help">JPG/JPEG, PNG of WebP, maximaal 20 MB. Grote afbeeldingen worden verkleind voor de website.</p>
    {busy && <p role="status">Afbeelding verwerken en uploaden…</p>}
    {error && <p role="alert" className="article-image-error">{error}</p>}
    {notice && <p role="status" className="article-image-help">{notice}</p>}
    {preview && <figure className="article-image-preview">
      {/* A normal image supports both external URLs and the storage preview. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview} alt="Voorbeeld van de gekozen artikelafbeelding" />
      <figcaption><button type="button" disabled={disabled || busy} onClick={() => { change(""); setNotice(""); setError(""); }}>Afbeelding weghalen</button></figcaption>
    </figure>}
    <details>
      <summary>Of gebruik een afbeeldingslink</summary>
      <label>Afbeeldingsadres<input value={url} maxLength={2000} disabled={disabled || busy} placeholder="https://… of /afbeelding.jpg"
        onChange={event => { change(event.target.value); setNotice(""); }} /></label>
    </details>
    <p className="article-image-help">Upload hier alleen openbare artikelafbeeldingen: de afbeelding is via de link toegankelijk, ook zolang je artikel nog een concept is.</p>
    {name && <input type="hidden" name={name} value={url} />}
  </div>;
}
