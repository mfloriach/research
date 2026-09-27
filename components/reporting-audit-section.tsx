"use client";

import { useState } from "react";
import { ArticleList } from "@/components/article-list";
import { CollapseList } from "@/components/collapse-list";
import { TabbedCard } from "@/components/tabbed-card";
import type { Article } from "@/lib/content";
import { auditCard, reportingCard } from "@/lib/content";

export type SelectedParagraph = {
  articleId: string;
  articleTitle: string;
  paragraphIndex: number;
  text: string;
};

export function ReportingAuditSection() {
  const [selected, setSelected] = useState<SelectedParagraph | null>(null);

  const handleParagraphClick = (article: Article, paragraphIndex: number) => {
    setSelected((prev) => {
      if (prev?.articleId === article.id && prev?.paragraphIndex === paragraphIndex) {
        return null;
      }
      return {
        articleId: article.id,
        articleTitle: article.title,
        paragraphIndex,
        text: article.paragraphs[paragraphIndex] ?? "",
      };
    });
  };

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

      <TabbedCard
        name="audit"
        title={auditCard.title}
        defaultTabId={auditCard.tabs[0]?.id}
        tabs={auditCard.tabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
          content: (
            <div className="space-y-4">
              <CollapseList items={tab.items} />
            </div>
          ),
        }))}
      />
    </div>
  );
}
