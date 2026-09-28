"use client";

import { useRouter } from "next/navigation";
import { CollapseList } from "@/components/collapse-list";
import { useWallet } from "@/app/hooks/use-wallet";
import type { CollapsibleItem, ContentTab } from "@/db/content";

export type FallacyTabContentProps = {
  tab: ContentTab<CollapsibleItem>;
  selectedParagraphId: string | null;
};

export function FallacyTabContent({ tab, selectedParagraphId }: FallacyTabContentProps) {
  const { isConnected } = useWallet();
  const router = useRouter();
  const createHref = selectedParagraphId
    ? `/debate/fallacies/create?paragraphId=${selectedParagraphId}`
    : "/debate/fallacies/create";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={!isConnected}
          title={isConnected ? "Create a new fallacy" : "Connect your wallet to create"}
          onClick={() => router.push(createHref)}
        >
          Create fallacy
        </button>
      </div>
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
