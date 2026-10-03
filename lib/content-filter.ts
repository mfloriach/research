/**
 * Filtering and ordering for the reporting card.
 *
 * Pure helpers so the page stays a thin shell: parsing and serialising the
 * query string, deriving the label facets from the content that actually
 * exists, and narrowing each tab to the articles that match.
 */
import type { Article, ContentTab } from "@/db/nuclear";

export type ArticleTypeFilter = "all" | "text" | "video";
export type ArticleSortMode = "default" | "newest" | "oldest";

export type ArticleFilter = {
  type: ArticleTypeFilter;
  /** Selected labels; empty means no label constraint. Combined with OR. */
  labels: string[];
  sort: ArticleSortMode;
};

export const DEFAULT_ARTICLE_FILTER: ArticleFilter = {
  type: "all",
  labels: [],
  sort: "default",
};

export const ARTICLE_TYPE_OPTIONS: ReadonlyArray<{
  value: ArticleTypeFilter;
  label: string;
}> = [
  { value: "all", label: "All formats" },
  { value: "text", label: "Text" },
  { value: "video", label: "Video" },
];

export const ARTICLE_SORT_OPTIONS: ReadonlyArray<{
  value: ArticleSortMode;
  label: string;
}> = [
  { value: "default", label: "Editorial order" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

export function isDefaultArticleFilter(filter: ArticleFilter): boolean {
  return (
    filter.type === "all" &&
    filter.labels.length === 0 &&
    filter.sort === "default"
  );
}

/** Articles with no explicit type predate the media kind and are text. */
function matchesType(article: Article, type: ArticleTypeFilter): boolean {
  if (type === "all") {
    return true;
  }
  return (article.type ?? "text") === type;
}

function matchesLabels(article: Article, labels: readonly string[]): boolean {
  if (labels.length === 0) {
    return true;
  }
  return labels.some((label) => article.labels.includes(label));
}

/** Dated articles first, undated last — in both directions. */
function compareDateAsc(a: Article, b: Article): number {
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

function compareDateDesc(a: Article, b: Article): number {
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

/**
 * Every label reachable from the content: tab labels plus article labels.
 *
 * Derived rather than taken from `ARGUMENT_LABELS`, so labels nothing uses
 * do not appear as options that can only ever return nothing.
 */
export function availableLabels(
  tabs: readonly ContentTab<Article>[],
): string[] {
  const labels = new Set<string>();
  for (const tab of tabs) {
    labels.add(tab.label);
    for (const item of tab.items) {
      for (const label of item.labels) {
        labels.add(label);
      }
    }
  }
  return [...labels].sort((a, b) => a.localeCompare(b));
}

export type FilteredReportingCard = {
  /** Tabs left with no matching articles are dropped. */
  tabs: ContentTab<Article>[];
  /** Matching articles across every tab. */
  total: number;
};

/**
 * Narrows reporting tabs to the articles matching `filter`, dropping tabs that
 * end up empty. Sorting applies within each tab and never moves an article
 * between tabs.
 */
export function filterReportingTabs(
  tabs: readonly ContentTab<Article>[],
  filter: ArticleFilter,
): FilteredReportingCard {
  const narrowed = tabs
    .map((tab) => ({
      ...tab,
      items: tab.items.filter(
        (item) =>
          matchesType(item, filter.type) && matchesLabels(item, filter.labels),
      ),
    }))
    .filter((tab) => tab.items.length > 0);

  const sorted: ContentTab<Article>[] =
    filter.sort === "default"
      ? narrowed
      : narrowed.map((tab) => ({
          ...tab,
          items:
            filter.sort === "newest"
              ? [...tab.items].sort(compareDateDesc)
              : [...tab.items].sort(compareDateAsc),
        }));

  return {
    tabs: sorted,
    total: sorted.reduce((count, tab) => count + tab.items.length, 0),
  };
}

function isArticleTypeFilter(value: string | null): value is ArticleTypeFilter {
  return ARTICLE_TYPE_OPTIONS.some((option) => option.value === value);
}

function isArticleSortMode(value: string | null): value is ArticleSortMode {
  return ARTICLE_SORT_OPTIONS.some((option) => option.value === value);
}

/**
 * Reads a filter from the query string. Unrecognised values fall back to the
 * default rather than filtering everything away, so a hand-edited or stale
 * URL still renders the dossier.
 */
export function parseArticleFilter(params: URLSearchParams): ArticleFilter {
  const type = params.get("type");
  const sort = params.get("sort");
  const labels = params.get("labels");

  return {
    type: isArticleTypeFilter(type) ? type : "all",
    sort: isArticleSortMode(sort) ? sort : "default",
    labels: (labels ?? "")
      .split(",")
      .map((label) => label.trim())
      .filter((label) => label !== ""),
  };
}

/** Serialises a filter, omitting anything left at its default. */
export function articleFilterQuery(filter: ArticleFilter): string {
  const params = new URLSearchParams();
  if (filter.type !== "all") {
    params.set("type", filter.type);
  }
  if (filter.labels.length > 0) {
    params.set("labels", filter.labels.join(","));
  }
  if (filter.sort !== "default") {
    params.set("sort", filter.sort);
  }
  const query = params.toString();
  return query === "" ? "" : `?${query}`;
}

/** Toggles one label in the filter, preserving the other facets. */
export function toggleLabel(
  filter: ArticleFilter,
  label: string,
): ArticleFilter {
  return {
    ...filter,
    labels: filter.labels.includes(label)
      ? filter.labels.filter((entry) => entry !== label)
      : [...filter.labels, label],
  };
}
