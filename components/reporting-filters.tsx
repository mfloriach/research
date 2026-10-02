"use client";

import {
  ARTICLE_SORT_OPTIONS,
  ARTICLE_TYPE_OPTIONS,
  isDefaultArticleFilter,
  toggleLabel,
  type ArticleFilter,
  type ArticleSortMode,
  type ArticleTypeFilter,
} from "@/lib/content-filter";

export type ReportingFiltersProps = {
  filter: ArticleFilter;
  /** Labels reachable from the loaded content. */
  labels: readonly string[];
  onChange: (filter: ArticleFilter) => void;
};

/**
 * Format, label and date controls for the reporting card.
 *
 * Presentational only: it reports the filter upward and never touches the
 * URL, so the page owns persistence. Labels combine with OR.
 */
export function ReportingFilters({
  filter,
  labels,
  onChange,
}: ReportingFiltersProps) {
  const isDefault = isDefaultArticleFilter(filter);

  return (
    <section
      aria-label="Filter reporting articles"
      className="flex flex-wrap items-center gap-x-4 gap-y-3 mx-4"
    >
      <label className="flex items-center gap-2 text-sm">
        <span className="text-base-content/70">Format</span>
        <select
          className="select select-bordered select-sm"
          value={filter.type}
          onChange={(event) =>
            onChange({
              ...filter,
              type: event.target.value as ArticleTypeFilter,
            })
          }
        >
          {ARTICLE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-base-content/70">Date</span>
        <select
          className="select select-bordered select-sm"
          value={filter.sort}
          onChange={(event) =>
            onChange({ ...filter, sort: event.target.value as ArticleSortMode })
          }
        >
          {ARTICLE_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {labels.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-base-content/70">Labels</span>
          <ul className="flex flex-wrap gap-1.5">
            {labels.map((label) => {
              const selected = filter.labels.includes(label);
              return (
                <li key={label}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange(toggleLabel(filter, label))}
                    className={`badge badge-sm cursor-pointer ${
                      selected ? "badge-primary" : "badge-outline"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {isDefault ? null : (
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={() =>
            onChange({ ...filter, type: "all", labels: [], sort: "default" })
          }
        >
          Clear filters
        </button>
      )}
    </section>
  );
}
