"use client";
import { useCallback, useRef, useState } from "react";
import {
  loadWritingDocument,
  saveWritingDocument,
} from "@/app/admin/content/workspace-actions";
import type { ItemKey, WritingDocument } from "@/lib/admin/writing/model";
export function useWritingDocuments(initial: WritingDocument[]) {
  const [documents, setDocuments] = useState<Record<string, WritingDocument>>(
    () => Object.fromEntries(initial.map((d) => [d.key, d])),
  );
  const [dirty, setDirty] = useState<ItemKey[]>([]),
    [loading, setLoading] = useState<ItemKey[]>([]),
    [saving, setSaving] = useState<ItemKey[]>([]),
    [errors, setErrors] = useState<
      Record<string, { message: string; conflict?: boolean }>
    >({});
  const cache = useRef(documents),
    loads = useRef(new Map<ItemKey, Promise<void>>()),
    saves = useRef(new Set<ItemKey>());
  const put = useCallback((document: WritingDocument) => {
    cache.current = { ...cache.current, [document.key]: document };
    setDocuments(cache.current);
  }, []);
  const ensure = useCallback(
    async (key: ItemKey) => {
      if (cache.current[key]) return;
      if (loads.current.has(key)) return loads.current.get(key);
      const request = (async () => {
        setLoading((items) => [...items, key]);
        setErrors((items) => ({ ...items, [key]: { message: "" } }));
        try {
          const result = await loadWritingDocument(key);
          if (result.ok) put(result.value);
          else
            setErrors((items) => ({
              ...items,
              [key]: { message: result.message },
            }));
        } catch {
          setErrors((items) => ({
            ...items,
            [key]: {
              message: "Dit stuk kon niet worden geladen. Probeer opnieuw.",
            },
          }));
        } finally {
          loads.current.delete(key);
          setLoading((items) => items.filter((item) => item !== key));
        }
      })();
      loads.current.set(key, request);
      return request;
    },
    [put],
  );
  const edit = useCallback(
    (document: WritingDocument) => {
      put(document);
      setDirty((items) =>
        items.includes(document.key) ? items : [...items, document.key],
      );
    },
    [put],
  );
  const replace = useCallback(
    (document: WritingDocument) => {
      put(document);
      setDirty((items) => items.filter((key) => key !== document.key));
      setErrors((items) => ({ ...items, [document.key]: { message: "" } }));
    },
    [put],
  );
  const save = useCallback(
    async (key: ItemKey) => {
      if (saves.current.has(key) || !cache.current[key]) return null;
      const snapshot = cache.current[key];
      saves.current.add(key);
      setSaving((items) => [...items, key]);
      try {
        const result = await saveWritingDocument(snapshot);
        if (!result.ok) {
          setErrors((items) => ({
            ...items,
            [key]: { message: result.message, conflict: result.conflict },
          }));
          return null;
        }
        setErrors((items) => ({ ...items, [key]: { message: "" } }));
        if (cache.current[key] === snapshot) {
          put(result.value);
          setDirty((items) => items.filter((item) => item !== key));
        } else {
          // Preserve typing that happened after the submitted snapshot; advance its revision only.
          const ids = new Set(result.value.sections.map((s) => s.id));
          put({
            ...cache.current[key],
            revision: result.value.revision,
            updatedAt: result.value.updatedAt,
            sections: cache.current[key].sections.map((s) =>
              ids.has(s.id) ? { ...s, fresh: false } : s,
            ),
          });
        }
        return result.value;
      } catch {
        setErrors((items) => ({
          ...items,
          [key]: { message: "Opslaan lukte niet. Je tekst blijft staan." },
        }));
        return null;
      } finally {
        saves.current.delete(key);
        setSaving((items) => items.filter((item) => item !== key));
      }
    },
    [put],
  );
  return {
    documents,
    dirty,
    loading,
    saving,
    errors,
    ensure,
    edit,
    save,
    put,
    replace,
  };
}
