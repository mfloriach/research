import type { Article, ReportingParagraph } from "@/db/content";
import {
  ReportingArticleCard,
  type ParagraphSelection,
} from "@/components/reporting-article-card";

export type { ParagraphSelection };

export type ArticleListProps = {
  articles: readonly Article[];
  selected?: ParagraphSelection | null;
  onParagraphClick?: (
    article: Article,
    paragraph: ReportingParagraph,
    index: number,
  ) => void;
};

/**
 * Renders a tab's worth of articles, one collapsed card per article.
 *
 * A tab can hold several articles, so each gets its own card with its own
 * title and byline rather than the tab showing a single one.
 */
export function ArticleList({
  articles,
  selected,
  onParagraphClick,
}: ArticleListProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <ReportingArticleCard
          key={article.id}
          article={article}
          selected={selected}
          onParagraphClick={onParagraphClick}
        />
      ))}
    </div>
  );
}