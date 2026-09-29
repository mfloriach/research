"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CollapseList } from "@/components/collapse-list";
import { useAttestations } from "@/app/hooks/use-attestation";
import { useWallet } from "@/app/hooks/use-wallet";
import type { CollapsibleItem, ContentTab } from "@/db/content";

export type ContraargumentTabContentProps = {
  tab: ContentTab<CollapsibleItem>;
  selectedParagraphId: string | null;
};

export function ContraargumentTabContent({
  tab,
  selectedParagraphId,
}: ContraargumentTabContentProps) {
  const { isConnected } = useWallet();
  const router = useRouter();
  const createHref = selectedParagraphId
    ? `/debate/contraarguments/create?paragraphId=${selectedParagraphId}`
    : "/debate/contraarguments/create";

  const [openCounts, setOpenCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(tab.items.map((item) => [item.id, item.openCount ?? 0])),
  );

  const {
    items: attestations,
    attest,
    error: attestError,
    isReady: attestReady,
  } = useAttestations(tab.items.map((item) => item.id));

  async function handleOpen(itemId: string) {
    setOpenCounts((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
    try {
      const response = await fetch(
        `/api/audits/contraarguments/${itemId}/open`,
        { method: "POST" },
      );
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      const data = (await response.json()) as { openCount?: number };
      if (typeof data.openCount === "number") {
        setOpenCounts((prev) => ({ ...prev, [itemId]: data.openCount as number }));
      }
    } catch {
      setOpenCounts((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] ?? 1) - 1, 0) }));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={!isConnected}
          title={isConnected ? "Create a new contraargument" : "Connect your wallet to create"}
          onClick={() => router.push(createHref)}
        >
          Create contraargument
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
      <CollapseList
        items={tab.items}
        openCounts={openCounts}
        onOpen={handleOpen}
        attestations={attestations}
        onAttest={attest}
        canAttest={attestReady && isConnected}
      />
      {attestError ? (
        <p role="alert" className="text-xs text-error">
          {attestError}
        </p>
      ) : null}
    </div>
  );
}
