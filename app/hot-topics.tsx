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
          <p className="text-sm opacity-70">Loading hot topics…</p>
        ) : error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : total === 0 ? (
          <p className="text-sm opacity-70">
            No arguments match these filters. Clear them to see everything.
          </p>
        ) : (
          <HotTopicList items={items} />
        )}
      </div>
    </>
  );
}
