"use client";

import Link from "next/link";
import type { ArgumentSummary } from "@/lib/api-schemas";

export type HotTopicListProps = {
  items: readonly ArgumentSummary[];
};

/**
 * Hot-topic argument cards. Presentational only: each card links to the
 * argument dossier at `/debate/argument/[id]`.
 */
export function HotTopicList({ items }: HotTopicListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/debate/argument/${item.id}`}
            className="card bg-base-100 shadow-sm transition-shadow hover:shadow-md"
            aria-label={`Open argument ${item.title}`}
          >
            <div className="card-body gap-2 p-5">
              <h2 className="card-title text-xl">{item.title}</h2>
              <p className="text-sm text-base-content/70">{item.description}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {item.labels.map((label) => (
                  <span key={label} className="badge badge-outline badge-sm">
                    {label}
                  </span>
                ))}
                <time
                  dateTime={item.createdAt}
                  className="ml-auto text-xs text-base-content/60"
                >
                  {item.createdAt.slice(0, 10)}
                </time>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
