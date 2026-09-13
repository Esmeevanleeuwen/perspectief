"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadWritingPage } from "@/app/admin/content/workspace-actions";
import {
  emptyView,
  type WritingPage,
  type WritingState,
} from "@/lib/admin/writing/model";
export function useWritingSearch(state: WritingState, initial: WritingPage) {
  const { query, type, status, placement, collection } = state.view;
  const signature = JSON.stringify({
    collections: state.collections,
    sessions: [],
    links: [],
    view: { ...emptyView(), query, type, status, placement, collection },
  });
  const [cursor, setCursor] = useState({ signature, page: initial.page }),
    [result, setResult] = useState(initial),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const first = useRef(true),
    page = cursor.signature === signature ? cursor.page : 1;
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await loadWritingPage(JSON.parse(signature), page);
        if (cancelled) return;
        if (response.ok) setResult(response.value);
        else setError(response.message);
      } catch {
        if (!cancelled) setError("Laden lukte niet. Probeer opnieuw.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [signature, page, revision]);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  return {
    result,
    loading,
    error,
    onPage: (page: number) => setCursor({ signature, page }),
    refresh,
  };
}
