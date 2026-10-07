"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReportingAuditSection } from "@/components/reporting-audit-section";
import { ReportingFilters } from "@/components/reporting-filters";
import {
  articleFilterQuery,
  availableLabels,
  filterReportingTabs,
  parseArticleFilter,
  type ArticleFilter,
} from "@/lib/content-filter";
import {
  auditCard as auditCardFallback,
  argument as argumentFallback,
  reportingCard as reportingCardFallback,
} from "@/db/nuclear";
import type { DbContent } from "@/lib/content-db";
import { useWallet } from "@/app/hooks/use-wallet";

const fallbackContent: DbContent = {
  argument: argumentFallback,
  reportingCard: reportingCardFallback,
  auditCard: auditCardFallback,
};

export function Dossier({ id }: { id: string }) {
  const [content, setContent] = useState<DbContent>(fallbackContent);
  const { isConnected } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/content?id=${encodeURIComponent(id)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json() as Promise<DbContent>;
      })
      .then((data) => {
        if (!cancelled) {
          setContent(data);
        }
      })
      .catch((error) => {
        console.warn(
          "[page] falling back to static content:",
          (error as Error).message,
        );
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const { argument, reportingCard, auditCard } = content;

  // Read through a memo so a new URLSearchParams instance each render does
  // not rebuild the filter.
  const filter = useMemo(
    () => parseArticleFilter(searchParams),
    [searchParams],
  );

  const labels = useMemo(
    () => availableLabels(reportingCard.tabs),
    [reportingCard.tabs],
  );

  const { tabs, total } = useMemo(
    () => filterReportingTabs(reportingCard.tabs, filter),
    [reportingCard.tabs, filter],
  );

  const handleFilterChange = useCallback(
    (next: ArticleFilter) => {
      // replace, so toggling a filter does not stack history entries.
      router.replace(`/debate/argument/${id}${articleFilterQuery(next)}`, { scroll: false });
    },
    [router, id],
  );

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 mx-4">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            Dossier
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {argument.title}
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-base-content/70">
            {argument.description}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!isConnected}
          title={
            isConnected
              ? "Create a new report"
              : "Connect your wallet to create a report"
          }
          onClick={() => router.push(`/debate/create?argumentId=${id}`)}
        >
          Create new report
        </button>
      </div>

      <div className="mt-6">
        <ReportingFilters
          filter={filter}
          labels={labels}
          onChange={handleFilterChange}
        />
      </div>

      <ReportingAuditSection
        reportingCard={{ title: reportingCard.title, tabs }}
        auditCard={auditCard}
        reportingResetKey={articleFilterQuery(filter)}
        reportingEmpty={total === 0}
        argumentId={id}
      />
    </>
  );
}
