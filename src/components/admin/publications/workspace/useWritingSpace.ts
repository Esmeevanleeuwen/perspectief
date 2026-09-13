"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveWritingSpace } from "@/app/admin/content/workspace-actions";
import type { WritingState } from "@/lib/admin/writing/model";

/** Serialize writes, including changes made while a previous save is in flight. */
export function useWritingSpace(initial: WritingState, initialVersion: number) {
  const [state, setState] = useState(initial),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  const latest = useRef(initial),
    version = useRef(initialVersion),
    saved = useRef(JSON.stringify(initial)),
    inFlight = useRef(false),
    blocked = useRef(false);
  const update = useCallback(
    (change: (state: WritingState) => WritingState) => {
      const next = change(latest.current);
      latest.current = next;
      setState(next);
      setPending(JSON.stringify(next) !== saved.current);
    },
    [],
  );
  const persist = useCallback(async () => {
    if (inFlight.current || blocked.current) return;
    inFlight.current = true;
    setSaving(true);
    try {
      while (JSON.stringify(latest.current) !== saved.current) {
        const snapshot = latest.current,
          encoded = JSON.stringify(snapshot);
        const result = await saveWritingSpace(snapshot, version.current);
        if (!result.ok) {
          blocked.current = true;
          setError(result.message);
          return;
        }
        version.current = result.value.version;
        saved.current = encoded;
        setError("");
      }
      setPending(false);
    } catch {
      blocked.current = true;
      setError("Je indeling is nog niet opgeslagen. Probeer opnieuw.");
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void persist(), 500);
    return () => clearTimeout(timer);
  }, [state, persist]);
  const retry = useCallback(() => {
    blocked.current = false;
    setError("");
    void persist();
  }, [persist]);
  return { state, update, saving, error, retry, pending };
}
