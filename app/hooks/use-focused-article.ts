"use client";

import { useEffect, useState } from "react";

/**
 * Article id from the URL hash (e.g. `/debate/argument/abc#article-1`),
 * used to deep-open the matching card. Tracks `hashchange` so in-page
 * anchor clicks update it too. Empty hash resolves to `null`.
 */
export function useFocusedArticleId(): string | null {
  const [focusedId, setFocusedId] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : window.location.hash.replace(/^#/, "") || null,
  );

  useEffect(() => {
    function handleHashChange() {
      setFocusedId(window.location.hash.replace(/^#/, "") || null);
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return focusedId;
}
