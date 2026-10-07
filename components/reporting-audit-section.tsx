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
} from "@/db/types";

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
  /**
   * Change this to remount the reporting tabs. Its tab group is built from
   * radio inputs with `defaultChecked`, so swapping the tab list without a
   * remount leaves a stale selection behind.
   */
  reportingResetKey?: string;
  /** True when a filter narrowed every reporting tab away. */
  reportingEmpty?: boolean;
  /** Dossier id, threaded into audit create links for breadcrumb context. */
  argumentId?: string;
};

export function ReportingAuditSection({
  reportingCard,
  auditCard,
  reportingResetKey,
  reportingEmpty = false,
  argumentId,
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
        items: tab.items.filter((item: any) => wanted.has(item.id)),
      }))
      .filter((tab) => tab.items.length > 0);
    return filtered.length > 0 ? filtered : auditCard.tabs;
  }, [selected, auditCard.tabs]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 xl:grid-cols-12">
      <div className="xl:col-span-6">
        {reportingEmpty ? (
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body items-center gap-2 p-5 text-center">
              <h2 className="text-lg font-semibold">{reportingCard.title}</h2>
              <p className="text-sm text-base-content/70">
                No articles match these filters. Clear or widen them to see the
                reporting again.
              </p>
            </div>
          </div>
        ) : (
          <TabbedCard
            key={reportingResetKey ?? "reporting"}
            name="reporting"
            title={reportingCard.title}
            tone="paper"
            defaultTabId={reportingCard.tabs[0]?.id}
            tabs={reportingCard.tabs.map((tab) => ({
              id: tab.id,
              label: `${tab.label} (${tab.items.length})`,
              content: (
                <ArticleList
                  articles={tab.items}
                  selected={selected}
                  onParagraphClick={handleParagraphClick}
                />
              ),
            }))}
          />
        )}
      </div>

      <div className="xl:col-span-6">
        <div className="xl:sticky xl:top-20">
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
                  argumentId={argumentId}
                />
              ),
            }))}
          />
        </div>
      </div>
    </div>
  );
}

const auditTabContent: Record<string, React.ComponentType<any>> = {
  Contraargument: ContraargumentTabContent,
  Fallacies: FallacyTabContent,
  Evidences: EvidenceTabContent,
  Sources: SourceTabContent,
  Interpretation: InterpretationTabContent,
};

function AuditTabContent({
  tab,
  selectedParagraphId,
  argumentId,
}: {
  tab: ContentTab<CollapsibleItem>;
  selectedParagraphId: string | null;
  argumentId?: string;
}) {
  const TabContent = auditTabContent[tab.label];
  if (TabContent) {
    return (
      <TabContent
        tab={tab}
        selectedParagraphId={selectedParagraphId}
        argumentId={argumentId}
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
