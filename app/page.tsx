"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { ReportingAuditSection } from "@/components/reporting-audit-section";
import { SiteNavbar } from "@/components/site-navbar";
import {
  auditCard as auditCardFallback,
  heading as headingFallback,
  reportingCard as reportingCardFallback,
  site as siteFallback,
} from "@/lib/content";
import type { DbContent } from "@/lib/content-db";
import { useWallet } from "@/lib/use-wallet";

const fallbackContent: DbContent = {
  site: siteFallback,
  heading: headingFallback,
  reportingCard: reportingCardFallback,
  auditCard: auditCardFallback,
};

export default function Home() {
  const [content, setContent] = useState<DbContent>(fallbackContent);
  const { isConnected } = useWallet();
  const router = useRouter();

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
          setContent(data);
        }
      })
      .catch((error) => {
        console.warn("[page] falling back to static content:", (error as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { site, heading, reportingCard, auditCard } = content;

  return (
    <>
      <SiteNavbar brand={site.brand} search={site.search} avatar={site.avatar} menu={site.menu} />

      <main className="flex-1">
        <div className="mx-8 py-8 sm:py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <PageHeading title={heading.title} description={heading.description} />
            <button
              type="button"
              className="btn btn-primary"
              disabled={!isConnected}
              title={isConnected ? "Create a new report" : "Connect your wallet to create a report"}
              onClick={() => router.push("/debates/create")}
            >
              Create new report
            </button>
          </div>

          <ReportingAuditSection reportingCard={reportingCard} auditCard={auditCard} />
        </div>
      </main>
    </>
  );
}
