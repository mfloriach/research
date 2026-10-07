"use client";

import Link from "next/link";
import type { ArgumentSummary } from "@/lib/api-schemas";
import { ArrowRightIcon } from "./icons";

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
    <ul className="card-enter space-y-4">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/debate/argument/${item.id}`}
            className="card group border border-base-300 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0 active:scale-[0.995]"
            aria-label={`Open argument ${item.title}`}
            title={item.title}
          >
            <div className="card-body gap-2.5 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="card-title text-xl tracking-tight text-balance transition-colors group-hover:text-primary">
                  {item.title}
                </h2>
                <span className="mt-1 shrink-0 text-base-content/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary">
                  <ArrowRightIcon />
                </span>
              </div>
              <p className="max-w-[68ch] text-sm leading-relaxed text-base-content/70">
                {item.description}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {item.labels.map((label) => (
                  <span key={label} className="badge badge-outline badge-sm">
                    {label}
                  </span>
                ))}
                <time
                  dateTime={item.createdAt}
                  className="ml-auto font-mono text-xs tabular-nums text-base-content/60"
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
