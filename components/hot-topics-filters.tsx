"use client";

import {
  HOT_TOPICS_SORT_OPTIONS,
  isDefaultHotTopicsFilter,
  toggleHotTopicsLabel,
  type HotTopicsFilter,
  type HotTopicsSort,
} from "@/lib/hot-topics-filter";

export type HotTopicsFiltersProps = {
  filter: HotTopicsFilter;
  /** Labels reachable from the loaded arguments. */
  labels: readonly string[];
  onChange: (filter: HotTopicsFilter) => void;
};

/**
 * Label chips and creation-date order for the hot-topics list.
 *
 * Presentational only: it reports the filter upward and never touches the
 * URL, so the page owns persistence. Labels combine with OR.
 */
export function HotTopicsFilters({
  filter,
  labels,
  onChange,
}: HotTopicsFiltersProps) {
  const isDefault = isDefaultHotTopicsFilter(filter);

  return (
    <section
      aria-label="Filter hot topics"
      className="flex flex-wrap items-center gap-x-4 gap-y-3 mx-4"
    >
      <label className="flex items-center gap-2 text-sm">
        <span className="text-base-content/70">Date</span>
        <select
          className="select select-bordered select-sm"
          value={filter.sort}
          onChange={(event) =>
            onChange({
              ...filter,
              sort: event.target.value as HotTopicsSort,
            })
          }
        >
          {HOT_TOPICS_SORT_OPTIONS.map((option) => (
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
                    onClick={() => onChange(toggleHotTopicsLabel(filter, label))}
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
          onClick={() => onChange({ ...filter, labels: [], sort: "newest" })}
        >
          Clear filters
        </button>
      )}
    </section>
  );
}
