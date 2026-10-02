"use client";

import { useMemo, useState } from "react";
import { ArticleList } from "@/components/article-list";
import { CollapseList } from "@/components/collapse-list";
import { ContraargumentTabContent } from "@/components/contraargument-tab-content";
import { EvidenceTabContent } from "@/components/evidence-tab-content";
import { FallacyTabContent } from "@/components/fallacy-tab-content";
import { InterpretationTabContent } from "@/components/interpretation-tab-content";
import { SourceTabContent } from "@/components/source-tab-content";
import { TabbedCard } from "@/components/tabbed-card";
import type {
  Article,
  CollapsibleItem,
  ContentTab,
  ReportingParagraph,
} from "@/db/content";

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

export function ReportingAuditSection({
  reportingCard,
  auditCard,
}: ReportingAuditSectionProps) {
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
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 xl:grid-cols-12">
      <div className="xl:col-span-6">
        <TabbedCard
          name="reporting"
          title={reportingCard.title}
          tone="paper"
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
      </div>

      <div className="xl:col-span-6">
        <div className="xl:sticky xl:top-20">
          {selected ? (
            <p className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-primary/10 px-3 py-2 text-sm">
              <span>
                Linked to paragraph {selected.paragraphIndex + 1} of{" "}
                <span className="font-medium">{selected.articleTitle}</span>
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-xs shrink-0"
                onClick={() => setSelected(null)}
                aria-label="Clear paragraph selection"
                title="Show all audit items"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </p>
          ) : null}
          <TabbedCard
            key={selected?.paragraphId ?? "all"}
            name="audit"
            title={auditCard.title}
            defaultTabId={auditTabsToShow[0]?.id}
            tabs={auditTabsToShow.map((tab) => ({
              id: tab.id,
              label: `${tab.label} (${tab.items.length})`,
              content: (
                <AuditTabContent
                  tab={tab}
                  selectedParagraphId={selected?.paragraphId ?? null}
                />
              ),
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function AuditTabContent({
  tab,
  selectedParagraphId,
}: {
  tab: ContentTab<CollapsibleItem>;
  selectedParagraphId: string | null;
}) {
  if (tab.label === "Contraargument") {
    return (
      <ContraargumentTabContent
        tab={tab}
        selectedParagraphId={selectedParagraphId}
      />
    );
  }
  if (tab.label === "Fallacies") {
    return (
      <FallacyTabContent tab={tab} selectedParagraphId={selectedParagraphId} />
    );
  }
  if (tab.label === "Evidences") {
    return (
      <EvidenceTabContent tab={tab} selectedParagraphId={selectedParagraphId} />
    );
  }
  if (tab.label === "Sources") {
    return (
      <SourceTabContent tab={tab} selectedParagraphId={selectedParagraphId} />
    );
  }
  if (tab.label === "Interpretation") {
    return (
      <InterpretationTabContent
        tab={tab}
        selectedParagraphId={selectedParagraphId}
      />
    );
  }
  return (
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
  );
}
