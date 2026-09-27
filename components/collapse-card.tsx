export type CollapseCardProps = {
  title: string;
  paragraphs: readonly string[];
  author?: string;
  date?: string;
};

/**
 * daisyUI collapse card.
 *
 * Built on `<details>` so it needs no client JavaScript, and the title is
 * clamped to two lines while collapsed — the clamp is released once opened
 * via the `group-open:` variant. `collapse-arrow` renders the chevron that
 * `.collapse-title` reserves its inline-end padding for.
 */
export function CollapseCard({ title, paragraphs, author, date }: CollapseCardProps) {
  return (
    <details className="group collapse border border-base-300 bg-base-100">
      <summary className="collapse-title line-clamp-2 text-sm font-medium leading-6 group-open:line-clamp-none">
        {title}
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
