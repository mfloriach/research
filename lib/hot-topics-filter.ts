/**
 * Filtering and ordering for the hot-topics argument list.
 *
 * Pure helpers so the page stays a thin shell: parsing and serialising the
 * query string, toggling labels, and deriving the label facets from the
 * arguments that actually exist. Mirrors `lib/content-filter.ts`:
 * labels combine with OR, sorting is a `createdAt` dropdown.
 */
import type { HotTopicsSort } from "@/lib/api-schemas";

export type HotTopicsFilter = {
  /** Selected labels; empty means no label constraint. Combined with OR. */
  labels: string[];
  sort: HotTopicsSort;
};

export const DEFAULT_HOT_TOPICS_FILTER: HotTopicsFilter = {
  labels: [],
  sort: "newest",
};

export const HOT_TOPICS_SORT_OPTIONS: ReadonlyArray<{
  value: HotTopicsSort;
  label: string;
}> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

export function isDefaultHotTopicsFilter(filter: HotTopicsFilter): boolean {
  return filter.labels.length === 0 && filter.sort === "newest";
}

function isHotTopicsSort(value: string | null): value is HotTopicsSort {
  return HOT_TOPICS_SORT_OPTIONS.some((option) => option.value === value);
}

/**
 * Reads a filter from the query string. Unrecognised sort values fall back
 * to the default rather than returning nothing.
 */
export function parseHotTopicsFilter(
  params: URLSearchParams,
): HotTopicsFilter {
  const sort = params.get("sort");
  const labels = params.get("labels");

  return {
    sort: isHotTopicsSort(sort) ? sort : "newest",
    labels: (labels ?? "")
      .split(",")
      .map((label) => label.trim())
      .filter((label) => label !== ""),
  };
}

/** Serialises a filter, omitting anything left at its default. */
export function hotTopicsFilterQuery(filter: HotTopicsFilter): string {
  const params = new URLSearchParams();
  if (filter.labels.length > 0) {
    params.set("labels", filter.labels.join(","));
  }
  if (filter.sort !== "newest") {
    params.set("sort", filter.sort);
  }
  const query = params.toString();
  return query === "" ? "" : `?${query}`;
}

/** Toggles one label in the filter, preserving the sort. */
export function toggleHotTopicsLabel(
  filter: HotTopicsFilter,
  label: string,
): HotTopicsFilter {
  return {
    ...filter,
    labels: filter.labels.includes(label)
      ? filter.labels.filter((entry) => entry !== label)
      : [...filter.labels, label],
  };
}

/**
 * Every label reachable from the loaded arguments, so labels nothing uses
 * never appear as options that can only ever return nothing.
 */
export function availableArgumentLabels(
  items: readonly { labels: readonly string[] }[],
): string[] {
  const labels = new Set<string>();
  for (const item of items) {
    for (const label of item.labels) {
      labels.add(label);
    }
  }
  return [...labels].sort((a, b) => a.localeCompare(b));
}
