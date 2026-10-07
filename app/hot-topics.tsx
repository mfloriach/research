"use client";

import { HotTopicList } from "@/components/hot-topic-list";
import { HotTopicsFilters } from "@/components/hot-topics-filters";
import { hotTopicsFilterQuery } from "@/lib/hot-topics-filter";
import { useHotTopics } from "@/app/hooks/use-hot-topics";

/**
 * Hot-topics home: title, filters and the argument list.
 *
 * Thin shell over `useHotTopics`: every card links to the argument dossier
 * at `/debate/argument/[id]`.
 */
export function HotTopics() {
  const { filter, labels, items, total, loading, error, handleFilterChange } =
    useHotTopics();

  return (
    <>
      <div className="mx-4">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Hot topics
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-base-content/70">
          Open arguments, newest first. Filter by label or flip the creation
          order.
        </p>
      </div>

      <div className="mt-6">
        <HotTopicsFilters
          filter={filter}
          labels={labels}
          onChange={handleFilterChange}
        />
      </div>

      <div
        className="mt-6 mx-4"
        key={hotTopicsFilterQuery(filter)}
        aria-busy={loading}
      >
        {loading ? (
          <ul className="space-y-4" aria-label="Loading hot topics">
            {[0, 1, 2].map((index) => (
              <li
                key={index}
                className="card border border-base-300 bg-base-100"
                aria-hidden="true"
              >
                <div className="card-body gap-2.5 p-5 sm:p-6">
                  <div className="skeleton h-7 w-2/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-5/6" />
                  <div className="flex gap-1.5 pt-1">
                    <div className="skeleton h-5 w-16" />
                    <div className="skeleton h-5 w-20" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : total === 0 ? (
          <div className="rounded-box border border-dashed border-base-300 px-6 py-12 text-center">
            <p className="font-serif text-xl font-semibold">
              No arguments match these filters
            </p>
            <p className="mt-1 text-sm text-base-content/70">
              Clear them to see everything.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 font-mono text-xs tabular-nums text-base-content/60">
              {total} open argument{total === 1 ? "" : "s"}
            </p>
            <HotTopicList items={items} />
          </>
        )}
      </div>
    </>
  );
}
