"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { ArgumentSummary } from "@/lib/api-schemas";
import { buildCrumbs, type Crumb } from "@/lib/breadcrumbs";

/**
 * Breadcrumb trail for the current route. Keeps all logic out of the
 * presentational `Breadcrumbs` component: resolves the dossier title for
 * `/debate/argument/[id]` (from the path id) and for audit routes (from the
 * `?argumentId=` threaded through dossier entry points), then builds the
 * trail. Titles are cached per session so repeat visits fetch nothing.
 */
export function useBreadcrumbTrail(): Crumb[] {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [titles, setTitles] = useState<Record<string, string>>({});

  const dossierId = useMemo(() => {
    const segments = pathname.split("/").filter((segment) => segment !== "");
    return segments.length === 3 &&
      segments[0] === "debate" &&
      segments[1] === "argument"
      ? (segments[2] ?? null)
      : null;
  }, [pathname]);

  const neededId = dossierId ?? searchParams.get("argumentId");

  useEffect(() => {
    if (!neededId || titles[neededId]) {
      return;
    }
    let cancelled = false;
    fetch("/api/arguments")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json() as Promise<{ arguments: ArgumentSummary[] }>;
      })
      .then((data) => {
        if (cancelled) {
          return;
        }
        const found = (data.arguments ?? []).find(
          (item) => item.id === neededId,
        );
        if (found) {
          setTitles((prev) => ({ ...prev, [neededId]: found.title }));
        }
      })
      .catch(() => {
        // Titles are progressive enhancement; the trail falls back to
        // generic labels rather than failing the navigation chrome.
      });
    return () => {
      cancelled = true;
    };
  }, [neededId, titles]);

  return useMemo(
    () =>
      buildCrumbs({
        pathname,
        argumentId: neededId,
        argumentTitle: neededId ? (titles[neededId] ?? null) : null,
      }),
    [pathname, neededId, titles],
  );
}
