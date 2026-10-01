"use client";

import { useEffect, useState } from "react";
import type { DbContent } from "@/lib/content-db";
import {
  articleTableRows,
  buildContentIndex,
  resolveProvenanceItem,
  summarizeArticle,
  type ArticleTableRow,
  type ArticleTypeCount,
  type ContentIndex,
  type ResolvedItem,
} from "@/lib/provenance-view";

export type ArticleView = {
  id: string;
  title: string;
  label: string;
  total: number;
  counts: ArticleTypeCount[];
  rows: ArticleTableRow[];
};

export type ContentIndexView = {
  articles: ArticleView[];
  loading: boolean;
  resolve: (itemId: string) => ResolvedItem;
};

/**
 * Dossier content as provenance view models: per-article audit-type
 * summaries plus a resolver from on-chain item IDs to display names.
 * All derivation lives here so components stay presentational.
 */
export function useContentIndex(): ContentIndexView {
  const [index, setIndex] = useState<ContentIndex | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json() as Promise<DbContent>;
      })
      .then((data) => {
        if (!cancelled) {
          setIndex(buildContentIndex(data));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const articles: ArticleView[] = (index?.articles ?? []).map((article) => ({
    id: article.id,
    title: article.title,
    label: article.label,
    total: article.auditItemIds.length,
    counts: index ? summarizeArticle(index, article.id) : [],
    rows: index ? articleTableRows(index, article.id) : [],
  }));

  return {
    articles,
    loading,
    resolve: (itemId: string) => resolveProvenanceItem(index, itemId),
  };
}
