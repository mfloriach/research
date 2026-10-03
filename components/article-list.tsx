"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReportingArticleCard,
  type ParagraphSelection,
} from "@/components/reporting-article-card";
import { useAttestations } from "@/app/hooks/use-attestation";
import { useWallet } from "@/app/hooks/use-wallet";
import type { Article, ReportingParagraph } from "@/db/content";
import { setCountArticleOpen } from "@/lib/api";

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
 * title, byline, view count and attestations. Opening a card records the open
 * through `POST /api/articles/[id]/open`, matching how the audit tabs record
 * theirs.
 */
export function ArticleList({
  articles,
  selected,
  onParagraphClick,
}: ArticleListProps) {
  const { isConnected } = useWallet();
  const [openCounts, setOpenCounts] = useState<Record<string, number>>({});

  const articleIds = useMemo(
    () => articles.map((article) => article.id),
    [articles],
  );
  const {
    items: attestations,
    attest,
    isReady: attestReady,
  } = useAttestations(articleIds);

  // Stored counts seed the optimistic increment, so the first open of an
  // article with existing views continues from its stored total.
  const storedCounts = useMemo(
    () =>
      Object.fromEntries(
        articles.map((article) => [article.id, article.openCount ?? 0]),
      ),
    [articles],
  );

  const handleOpen = useCallback(
    async (articleId: string) => {
      setOpenCounts((prev) => ({
        ...prev,
        [articleId]: (prev[articleId] ?? storedCounts[articleId] ?? 0) + 1,
      }));

      try {
        const openCount = await setCountArticleOpen(articleId);
        setOpenCounts((prev) => ({ ...prev, [articleId]: openCount }));
      } catch {
        setOpenCounts((prev) => ({
          ...prev,
          [articleId]: Math.max((prev[articleId] ?? 1) - 1, 0),
        }));
      }
    },
    [storedCounts],
  );

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => {
        const attestation = attestations?.[article.id];
        return (
          <ReportingArticleCard
            key={article.id}
            article={article}
            selected={selected}
            onParagraphClick={onParagraphClick}
            openCounts={openCounts}
            onOpen={handleOpen}
            attestationCount={attestation?.count ?? null}
            hasAttested={attestation?.hasAttested ?? false}
            attesting={attestation?.pending ?? false}
            canAttest={attestReady && isConnected}
            onAttest={attest}
          />
        );
      })}
    </div>
  );
}
