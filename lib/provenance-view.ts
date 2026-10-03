import { AUDIT_TABS } from "@/db/nuclear";
import type { DbContent } from "@/lib/content-db";

export type IndexedArticle = {
  id: string;
  title: string;
  labels: string[];
  auditItemIds: string[];
  author?: string;
  authorAddress?: string;
};

export type IndexedAuditItem = {
  id: string;
  title: string;
  tab: string;
  date?: string;
  excerpt: string;
};

export type ContentIndex = {
  articles: IndexedArticle[];
  auditItems: Map<string, IndexedAuditItem>;
};

export function buildContentIndex(content: DbContent): ContentIndex {
  const byId = new Map<string, IndexedArticle>();
  for (const tab of content.reportingCard.tabs) {
    for (const item of tab.items) {
      const auditItemIds = [
        ...new Set(item.paragraphs.flatMap((p) => p.auditItemIds)),
      ];
      const existing = byId.get(item.id);
      if (existing) {
        existing.labels = [
          ...new Set([...existing.labels, tab.label, ...item.labels]),
        ];
        existing.auditItemIds = [
          ...new Set([...existing.auditItemIds, ...auditItemIds]),
        ];
        // An article appears under every matching tab; keep the first byline seen.
        existing.author = existing.author ?? item.author;
        existing.authorAddress = existing.authorAddress ?? item.authorAddress;
      } else {
        byId.set(item.id, {
          id: item.id,
          title: item.title,
          labels: [...new Set([tab.label, ...item.labels])],
          auditItemIds,
          ...(item.author ? { author: item.author } : {}),
          ...(item.authorAddress ? { authorAddress: item.authorAddress } : {}),
        });
      }
    }
  }
  const articles = [...byId.values()];

  const auditItems = new Map<string, IndexedAuditItem>();
  for (const tab of content.auditCard.tabs) {
    for (const item of tab.items) {
      auditItems.set(item.id, {
        id: item.id,
        title: item.title,
        tab: tab.label,
        ...(item.date ? { date: item.date } : {}),
        excerpt:
          item.paragraphs.find((paragraph) => paragraph.trim() !== "") ??
          item.title,
      });
    }
  }

  return { articles, auditItems };
}

export type ResolvedItem = {
  name: string;
  kind: string;
  isArticle: boolean;
};

export function resolveProvenanceItem(
  index: ContentIndex | null,
  itemId: string,
): ResolvedItem {
  const article = index?.articles.find((entry) => entry.id === itemId);
  if (article) {
    return { name: article.title, kind: "Article", isArticle: true };
  }
  const auditItem = index?.auditItems.get(itemId);
  if (auditItem) {
    return { name: auditItem.title, kind: auditItem.tab, isArticle: false };
  }
  return { name: itemId, kind: "Unknown", isArticle: false };
}

export type ArticleTypeCount = {
  tab: string;
  count: number;
  percent: number;
};

function tabRank(tab: string): number {
  const rank = AUDIT_TABS.findIndex((entry) => entry.label === tab);
  return rank === -1 ? AUDIT_TABS.length : rank;
}

export function summarizeArticle(
  index: ContentIndex,
  articleId: string,
): ArticleTypeCount[] {
  const article = index.articles.find((entry) => entry.id === articleId);
  if (!article) {
    return [];
  }
  const counts = new Map<string, number>();
  for (const id of article.auditItemIds) {
    const tab = index.auditItems.get(id)?.tab ?? "Unknown";
    counts.set(tab, (counts.get(tab) ?? 0) + 1);
  }
  const total = article.auditItemIds.length;
  return [...counts.entries()]
    .sort(([a], [b]) => tabRank(a) - tabRank(b))
    .map(([tab, count]) => ({
      tab,
      count,
      percent: total === 0 ? 0 : (count / total) * 100,
    }));
}

export type ArticleTableRow = {
  id: string;
  tab: string;
  excerpt: string;
  date?: string;
};

function hasDate(
  row: ArticleTableRow,
): row is ArticleTableRow & { date: string } {
  return row.date !== undefined;
}

export function articleTableRows(
  index: ContentIndex,
  articleId: string,
): ArticleTableRow[] {
  const article = index.articles.find((entry) => entry.id === articleId);
  if (!article) {
    return [];
  }
  const seen = new Set<string>();
  const rows: ArticleTableRow[] = [];
  for (const id of article.auditItemIds) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    const item = index.auditItems.get(id) ?? {
      id,
      title: id,
      tab: "Unknown",
      excerpt: id,
    };
    rows.push({
      id: item.id,
      tab: item.tab,
      excerpt: item.excerpt,
      ...(item.date ? { date: item.date } : {}),
    });
  }
  const dated = rows
    .filter(hasDate)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const undated = rows.filter((row) => !hasDate(row));
  return [...dated, ...undated];
}
