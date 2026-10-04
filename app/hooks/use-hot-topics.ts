"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ArgumentSummary } from "@/lib/api-schemas";
import {
  availableArgumentLabels,
  hotTopicsFilterQuery,
  parseHotTopicsFilter,
  type HotTopicsFilter,
} from "@/lib/hot-topics-filter";

export type UseHotTopicsResult = {
  filter: HotTopicsFilter;
  /** Labels reachable from the loaded arguments. */
  labels: string[];
  items: ArgumentSummary[];
  total: number;
  loading: boolean;
  error: string | null;
  handleFilterChange: (next: HotTopicsFilter) => void;
};

/**
 * Hot-topics list state. Keeps all logic out of components: the page reads
 * `filter`/`items` and reports changes upward, which sync to the URL with
 * `replace` so toggling a filter does not stack history entries.
 */
export function useHotTopics(): UseHotTopicsResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ArgumentSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);

  // Read through a memo so a new URLSearchParams instance each render does
  // not rebuild the filter.
  const filter = useMemo(
    () => parseHotTopicsFilter(searchParams),
    [searchParams],
  );
  const filterQuery = hotTopicsFilterQuery(filter);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/arguments${filterQuery}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json() as Promise<{
          arguments: ArgumentSummary[];
          total: number;
        }>;
      })
      .then((data) => {
        if (!cancelled) {
          setItems(data.arguments ?? []);
          setTotal(data.total ?? 0);
          setError(null);
          setLoading(false);
          setLoadedQuery(filterQuery);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
          setError("Could not load hot topics. Try again.");
          setLoading(false);
          setLoadedQuery(filterQuery);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [filterQuery]);

  const refetching = loadedQuery !== null && loadedQuery !== filterQuery;

  const labels = useMemo(() => availableArgumentLabels(items), [items]);

  const handleFilterChange = useCallback(
    (next: HotTopicsFilter) => {
      router.replace(`/${hotTopicsFilterQuery(next)}`, { scroll: false });
    },
    [router],
  );

  return {
    filter,
    labels,
    items,
    total,
    loading: loading || refetching,
    error: refetching ? null : error,
    handleFilterChange,
  };
}
