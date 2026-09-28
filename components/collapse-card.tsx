"use client";

import type { SyntheticEvent } from "react";

export type CollapseCardProps = {
  title: string;
  paragraphs: readonly string[];
  author?: string;
  date?: string;
  openCount?: number;
  onOpen?: () => void;
};

function EyeIcon() {
  return (
    <svg
      className="h-4 w-4 opacity-60"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/**
 * daisyUI collapse card.
 *
 * Built on `<details>`; the title is clamped to two lines while collapsed —
 * the clamp is released once opened via the `group-open:` variant.
 * `collapse-arrow` renders the chevron that `.collapse-title` reserves its
 * inline-end padding for. Optionally reports opens and shows an eye icon
 * with the open count on the right side of the header.
 */
export function CollapseCard({ title, paragraphs, author, date, openCount, onOpen }: CollapseCardProps) {
  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if ((event.nativeEvent as ToggleEvent).newState === "open") {
      onOpen?.();
    }
  }

  return (
    <details className="group collapse border border-base-300 bg-base-100" onToggle={handleToggle}>
      <summary className="collapse-title flex items-center gap-2 text-sm font-medium leading-6">
        <span className="line-clamp-2 flex-1 group-open:line-clamp-none">{title}</span>
        {typeof openCount === "number" ? (
          <span
            className="flex shrink-0 items-center gap-1 text-xs font-normal text-base-content/60"
            title={`${openCount} ${openCount === 1 ? "open" : "opens"}`}
          >
            <EyeIcon />
            <span aria-label={`${openCount} opens`}>{openCount}</span>
          </span>
        ) : null}
      </summary>
      <div className="collapse-content">
        <div className="space-y-3 text-sm leading-6 text-base-content/80">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {(author ?? date) && (
          <p className="mt-3 text-xs text-base-content/60">
            {author && <span>By {author}</span>}
            {author && date && <span aria-hidden="true"> · </span>}
            {date && (
              <time dateTime={date}>
                {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            )}
          </p>
        )}
      </div>
    </details>
  );
}
