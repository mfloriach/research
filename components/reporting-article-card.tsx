"use client";

import Link from "next/link";
import { useEffect, useState, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { CollapseIcon, ExpandIcon, EyeIcon, ShieldCheckIcon } from "@/components/icons";
import type { Article, ReportingParagraph } from "@/db/content";
import { config } from "@/lib/config";
import {
  formatAbsoluteDate,
  formatRelativeDate,
} from "@/lib/relative-date";
import { youtubeEmbedUrl, youtubeVideoId } from "@/lib/youtube";

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

/**
 * Embedded player for a video article.
 *
 * Falls back to a plain link when the stored URL is not a recognisable
 * YouTube link, so a bad value degrades instead of rendering an empty frame.
 */
function ArticleVideo({ article }: { article: Article }) {
  const url = article.videoUrl ?? "";
  const videoId = article.type === "video" ? youtubeVideoId(url) : null;

  if (!videoId) {
    return article.type === "video" && url !== "" ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="link link-hover text-sm"
      >
        Watch the video on YouTube
      </a>
    ) : null;
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        className="h-full w-full"
        src={youtubeEmbedUrl(videoId)}
        title={article.title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
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

  const [expanded, setExpanded] = useState(false);

  function handleExpand(event: SyntheticEvent<HTMLButtonElement>) {
    // The button lives inside <summary>: don't toggle the card on click.
    event.preventDefault();
    event.stopPropagation();
    setExpanded(true);
    // Expanding a card counts as an open view.
    onOpen?.(article.id);
  }

  function handleCollapse() {
    setExpanded(false);
  }

  useEffect(() => {
    if (!expanded) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

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

  const video = <ArticleVideo article={article} />;
  const labels = article.labels.length > 0 ? (
    <ul aria-label="Article labels" className="flex flex-wrap gap-1.5">
      {article.labels.map((label) => (
        <li key={label}>
          <span className="badge badge-outline badge-sm">{label}</span>
        </li>
      ))}
    </ul>
  ) : null;

  const body = (
    <>
      {video}
      {labels}
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
    </>
  );

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
            <span className="flex flex-wrap items-center gap-x-2">
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
              {article.date ? (
                <time
                  dateTime={article.date}
                  title={formatAbsoluteDate(article.date)}
                >
                  {formatRelativeDate(article.date)}
                </time>
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
              <button
                type="button"
                onClick={handleExpand}
                title="Expand to full screen"
                aria-label="Expand to full screen"
                aria-pressed={expanded}
                className="btn btn-ghost btn-xs shrink-0 px-1.5 font-normal text-base-content/60"
              >
                <ExpandIcon />
              </button>
            </span>
          </span>
        ) : null}
      </summary>
      <div className="collapse-content space-y-3">{body}</div>
      {expanded ? createPortal(
        // Portalled out of the card so the fixed overlay is not clipped or
        // stacked beneath the sticky audit column / tab overflow containers.
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCollapse}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={article.title}
            className="card h-[90vh] w-[90vw] max-w-7xl overflow-y-auto bg-base-100 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="card-body gap-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-serif text-xl font-semibold leading-tight">
                  {article.title}
                </h3>
                <button
                  type="button"
                  onClick={handleCollapse}
                  title="Return to list"
                  aria-label="Return to list"
                  className="btn btn-ghost btn-sm shrink-0 px-2"
                >
                  <CollapseIcon />
                </button>
              </div>
              <div className="space-y-3">{body}</div>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </details>
  );
}