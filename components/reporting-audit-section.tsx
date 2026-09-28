"use client";

import { useMemo, useState } from "react";
import { ArticleList } from "@/components/article-list";
import { CollapseList } from "@/components/collapse-list";
import { TabbedCard } from "@/components/tabbed-card";
import type { Article, CollapsibleItem, ContentTab, ReportingParagraph } from "@/lib/content";

export type SelectedParagraph = {
  articleId: string;
  articleTitle: string;
  paragraphId: string;
  paragraphIndex: number;
  text: string;
  auditItemIds: string[];
};

export type ReportingAuditSectionProps = {
  reportingCard: {
    title: string;
    tabs: ContentTab<Article>[];
  };
  auditCard: {
    title: string;
    tabs: ContentTab<CollapsibleItem>[];
  };
};

export function ReportingAuditSection({ reportingCard, auditCard }: ReportingAuditSectionProps) {
  const [selected, setSelected] = useState<SelectedParagraph | null>(null);

  const handleParagraphClick = (
    article: Article,
    paragraph: ReportingParagraph,
    index: number,
  ) => {
    setSelected((prev) => {
      if (prev?.paragraphId === paragraph.id) {
        return null;
      }
      return {
        articleId: article.id,
        articleTitle: article.title,
        paragraphId: paragraph.id,
        paragraphIndex: index,
        text: paragraph.text,
        auditItemIds: paragraph.auditItemIds,
      };
    });
  };

  const auditTabsToShow = useMemo(() => {
    if (!selected) {
      return auditCard.tabs;
    }
    const wanted = new Set(selected.auditItemIds);
    const filtered = auditCard.tabs
      .map((tab) => ({
        ...tab,
        items: tab.items.filter((item) => wanted.has(item.id)),
      }))
      .filter((tab) => tab.items.length > 0);
    return filtered.length > 0 ? filtered : auditCard.tabs;
  }, [selected, auditCard.tabs]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
      <TabbedCard
        name="reporting"
        title={reportingCard.title}
        defaultTabId={reportingCard.tabs[0]?.id}
        tabs={reportingCard.tabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
          content: (
            <ArticleList
              articles={tab.items}
              selected={selected}
              onParagraphClick={handleParagraphClick}
            />
          ),
        }))}
      />

      <div className="space-y-3">
        <TabbedCard
          key={selected?.paragraphId ?? "all"}
          name="audit"
          title={auditCard.title}
          defaultTabId={auditTabsToShow[0]?.id}
          tabs={auditTabsToShow.map((tab) => ({
            id: tab.id,
            label: `${tab.label} (${tab.items.length})`,
            content: (
              <div className="space-y-4">
                {(tab.author ?? tab.date) && (
                  <p className="text-xs text-base-content/60">
                    {tab.author && <span>By {tab.author}</span>}
                    {tab.author && tab.date && <span aria-hidden="true"> · </span>}
                    {tab.date && (
                      <time dateTime={tab.date}>
                        {new Date(`${tab.date}T00:00:00`).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    )}
                  </p>
                )}
                <CollapseList items={tab.items} />
              </div>
            ),
          }))}
        />
      </div>
    </div>
  );
}
