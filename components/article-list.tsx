import { Fragment } from "react";
import type { Article, ReportingParagraph } from "@/db/content";
import { config } from "@/lib/config";

/** Content constraint: no article may exceed this many words. */
export const ARTICLE_WORD_LIMIT = 500;

export type ParagraphSelection = {
  articleId: string;
  paragraphId: string;
};

function countWords(paragraphs: readonly ReportingParagraph[]): number {
  return paragraphs
    .map((p) => p.text)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function Article({
  article,
  selected,
  onParagraphClick,
}: {
  article: Article;
  selected?: ParagraphSelection | null;
  onParagraphClick?: (article: Article, paragraph: ReportingParagraph, index: number) => void;
}) {
  const words = countWords(article.paragraphs);

  if (!config.isProduction && words > ARTICLE_WORD_LIMIT) {
    console.warn(
      `[article] "${article.title}" is ${words} words, over the ${ARTICLE_WORD_LIMIT}-word limit.`,
    );
  }

  return (
    <article className="space-y-4">
      <h3 className="text-lg font-semibold leading-7">{article.title}</h3>
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
          selected?.articleId === article.id && selected?.paragraphId === paragraph.id;
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
                ? "cursor-pointer px-2 py-1 hover:bg-base-200/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                : "cursor-default",
              isSelected ? "bg-primary/10 outline outline-1 outline-primary" : "",
            ].join(" ")}
          >
            {paragraph.text}
          </button>
        );
      })}
    </article>
  );
}

export type ArticleListProps = {
  articles: readonly Article[];
  selected?: ParagraphSelection | null;
  onParagraphClick?: (article: Article, paragraph: ReportingParagraph, index: number) => void;
};

/** Renders a tab's worth of articles, separated by a daisyUI divider. */
export function ArticleList({ articles, selected, onParagraphClick }: ArticleListProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {articles.map((article, index) => (
        <Fragment key={article.id}>
          {index > 0 && <div className="divider" />}
          <Article article={article} selected={selected} onParagraphClick={onParagraphClick} />
        </Fragment>
      ))}
    </div>
  );
}
