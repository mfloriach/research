import type { CollapsibleItem } from "@/db/nuclear";

export type AuditSortMode =
  | "newest"
  | "oldest"
  | "most-attested"
  | "most-viewed";

export const AUDIT_SORT_OPTIONS: ReadonlyArray<{
  value: AuditSortMode;
  label: string;
}> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most-attested", label: "Most Attested" },
  { value: "most-viewed", label: "Most views" },
];

export type AuditSortCounts = {
  openCounts?: Readonly<Record<string, number>>;
  attestationCounts?: Readonly<Record<string, number | null>>;
};

/**
 * Stable sort of audit items. Ties keep tab order. Items missing the sort
 * key sink to the bottom in every mode (dateless items for date sorts,
 * unloaded `null` attestation counts for most-attested).
 */
export function sortAuditItems(
  items: readonly CollapsibleItem[],
  mode: AuditSortMode,
  counts: AuditSortCounts = {},
): CollapsibleItem[] {
  const openCounts = counts.openCounts ?? {};
  const attestationCounts = counts.attestationCounts ?? {};

  function viewsOf(item: CollapsibleItem): number {
    return openCounts[item.id] ?? item.openCount ?? 0;
  }

  function attestationsOf(item: CollapsibleItem): number {
    return attestationCounts[item.id] ?? -1;
  }

  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      switch (mode) {
        case "newest":
          return compareDateDesc(a.item, b.item) || a.index - b.index;
        case "oldest":
          return compareDateAsc(a.item, b.item) || a.index - b.index;
        case "most-attested":
          return (
            attestationsOf(b.item) - attestationsOf(a.item) || a.index - b.index
          );
        case "most-viewed":
          return viewsOf(b.item) - viewsOf(a.item) || a.index - b.index;
      }
    })
    .map(({ item }) => item);
}

function compareDateDesc(a: CollapsibleItem, b: CollapsibleItem): number {
  if (a.date && b.date) {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  }
  if (a.date) {
    return -1;
  }
  if (b.date) {
    return 1;
  }
  return 0;
}

function compareDateAsc(a: CollapsibleItem, b: CollapsibleItem): number {
  if (a.date && b.date) {
    return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
  }
  if (a.date) {
    return -1;
  }
  if (b.date) {
    return 1;
  }
  return 0;
}
