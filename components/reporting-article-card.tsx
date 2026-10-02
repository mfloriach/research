"use client";

import type { Article, ReportingParagraph } from "@/db/content";
import { config } from "@/lib/config";

/** Content constraint: no article may exceed this many words. */
export const ARTICLE_WORD_LIMIT = 500;

export type ParagraphSelection = {
  articleId: string;
  paragraphId: string;
};

export type ReportingArticleCardProps = {
  article: Article;
  selected?: ParagraphSelection | null;
  onParagraphClick?: (
    article: Article,
    paragraph: ReportingParagraph,
    index: number,
  ) => void;
};

function countWords(paragraphs: readonly ReportingParagraph[]): number {
  return paragraphs
    .map((p) => p.text)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Formats an ISO `YYYY-MM-DD` date, matching the audit cards. */
function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * One reporting article as a collapsed card.
 *
 * A reporting tab can hold several articles, so each one carries its own
 * byline in the summary rather than the tab showing a single one. Built on
 * `<details>` and closed by default; the title is clamped to two lines while
 * collapsed, with the clamp released via the `group-open:` variant once open.
 * Paragraphs stay clickable inside the content, since selecting one drives the
 * audit card.
 */
export function ReportingArticleCard({
  article,
  selected,
  onParagraphClick,
}: ReportingArticleCardProps) {
  const words = countWords(article.paragraphs);

  if (!config.isProduction && words > ARTICLE_WORD_LIMIT) {
    console.warn(
      `[article] "${article.title}" is ${words} words, over the ${ARTICLE_WORD_LIMIT}-word limit.`,
    );
  }

  return (
    <details
      id={article.id}
      className="group scroll-mt-24 collapse border border-base-300 bg-base-100"
    >
      <summary className="collapse-title flex flex-col gap-1 text-sm font-medium leading-6">
        <span className="line-clamp-2 font-serif text-lg font-semibold leading-7 group-open:line-clamp-none">
          {article.title}
        </span>
        {(article.author ?? article.date) && (
          <span className="text-xs font-normal text-base-content/60">
            {article.author && <span>By {article.author}</span>}
            {article.author && article.date && (
              <span aria-hidden="true"> · </span>
            )}
            {article.date && (
              <time dateTime={article.date}>{formatDate(article.date)}</time>
            )}
          </span>
        )}
      </summary>
      <div className="collapse-content space-y-3">
        {article.labels.length > 0 ? (
          <ul aria-label="Article labels" className="flex flex-wrap gap-1.5">
            {article.labels.map((label) => (
              <li key={label}>
                <span className="badge badge-outline badge-sm">{label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {article.paragraphs.map((paragraph, index) => {
          const isSelected =
            selected?.articleId === article.id &&
            selected?.paragraphId === paragraph.id;
          const clickable = typeof onParagraphClick === "function";
          return (
            <button
              key={paragraph.id}
              type="button"
              disabled={!clickable}
              onClick={() => onParagraphClick?.(article, paragraph, index)}
              aria-pressed={isSelected}
              title={clickable ? "Click to audit this paragraph" : undefined}
              className={[
                "block w-full rounded-md text-left leading-7 transition-colors",
                "text-base-content/80",
                clickable
                  ? "cursor-pointer px-2 py-1 hover:bg-base-300/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  : "cursor-default",
                isSelected ? "bg-primary/10 outline outline-1 outline-primary" : "",
              ].join(" ")}
            >
              {paragraph.text}
            </button>
          );
        })}
      </div>
    </details>
  );
}