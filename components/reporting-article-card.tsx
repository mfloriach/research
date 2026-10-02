"use client";

import Link from "next/link";
import type { SyntheticEvent } from "react";
import { EyeIcon, ShieldCheckIcon } from "@/components/icons";
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
  /** Open counts after local increments, falling back to the stored count. */
  openCounts?: Readonly<Record<string, number>>;
  onOpen?: (articleId: string) => void;
  /** On-chain attestation count, or null/undefined while unavailable. */
  attestationCount?: number | null;
  hasAttested?: boolean;
  attesting?: boolean;
  canAttest?: boolean;
  onAttest?: (articleId: string) => void;
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
 * byline, view count and attestations in the summary rather than the tab
 * showing a single set. Built on `<details>` and closed by default; the title
 * is clamped to two lines while collapsed, with the clamp released via the
 * `group-open:` variant once open. Paragraphs stay clickable inside the
 * content, since selecting one drives the audit card.
 */
export function ReportingArticleCard({
  article,
  selected,
  onParagraphClick,
  openCounts,
  onOpen,
  attestationCount,
  hasAttested,
  attesting,
  canAttest,
  onAttest,
}: ReportingArticleCardProps) {
  const words = countWords(article.paragraphs);

  if (!config.isProduction && words > ARTICLE_WORD_LIMIT) {
    console.warn(
      `[article] "${article.title}" is ${words} words, over the ${ARTICLE_WORD_LIMIT}-word limit.`,
    );
  }

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if ((event.nativeEvent as ToggleEvent).newState === "open") {
      onOpen?.(article.id);
    }
  }

  function handleAttest(event: SyntheticEvent<HTMLButtonElement>) {
    // The button lives inside <summary>: don't toggle the card on click.
    event.preventDefault();
    event.stopPropagation();
    onAttest?.(article.id);
  }

  const attestTitle = hasAttested
    ? "Attested by this wallet"
    : canAttest
      ? "Attest this article on-chain"
      : "Connect your wallet to attest";

  const openCount = openCounts?.[article.id] ?? article.openCount;
  const hasByline = Boolean(article.author ?? article.date);
  const showMeta = hasByline || typeof openCount === "number" || Boolean(onAttest);

  return (
    <details
      id={article.id}
      className="group scroll-mt-24 collapse border border-base-300 bg-base-100"
      onToggle={handleToggle}
    >
      <summary className="collapse-title flex flex-col gap-1 text-sm font-medium leading-6">
        <span className="line-clamp-2 font-serif text-lg font-semibold leading-7 group-open:line-clamp-none">
          {article.title}
        </span>
        {showMeta ? (
          <span className="flex items-center justify-between gap-2 text-xs font-normal text-base-content/60">
            <span className="flex flex-wrap items-center">
              {article.author ? (
                article.authorAddress ? (
                  <Link
                    href={`/debate/provenance?address=${encodeURIComponent(
                      article.authorAddress,
                    )}`}
                    title="View on-chain provenance for this author"
                    className="link link-hover"
                    // Navigating must not also toggle the card.
                    onClick={(event) => event.stopPropagation()}
                  >
                    By {article.author}
                  </Link>
                ) : (
                  <span>By {article.author}</span>
                )
              ) : null}
              {article.author && article.date ? (
                <span aria-hidden="true"> · </span>
              ) : null}
              {article.date ? (
                <time dateTime={article.date}>{formatDate(article.date)}</time>
              ) : null}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {typeof openCount === "number" ? (
                <span
                  className="flex items-center gap-1"
                  title={`${openCount} ${openCount === 1 ? "open" : "opens"}`}
                >
                  <EyeIcon />
                  <span aria-label={`${openCount} opens`}>{openCount}</span>
                </span>
              ) : null}
              {onAttest ? (
                <button
                  type="button"
                  onClick={handleAttest}
                  disabled={!canAttest || attesting || hasAttested}
                  title={attestTitle}
                  aria-label={attestTitle}
                  className={`btn btn-ghost btn-xs shrink-0 gap-1 px-1.5 font-normal ${
                    hasAttested ? "text-success" : "text-base-content/60"
                  }`}
                >
                  {attesting ? (
                    <span
                      className="loading loading-spinner loading-xs"
                      aria-hidden="true"
                    />
                  ) : (
                    <ShieldCheckIcon filled={hasAttested} />
                  )}
                  {typeof attestationCount === "number" ? (
                    <span aria-label={`${attestationCount} attestations`}>
                      {attestationCount}
                    </span>
                  ) : null}
                </button>
              ) : null}
            </span>
          </span>
        ) : null}
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