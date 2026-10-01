"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CollapseList } from "@/components/collapse-list";
import { useAttestations } from "@/app/hooks/use-attestation";
import {
  AUDIT_SORT_OPTIONS,
  sortAuditItems,
  type AuditSortMode,
} from "@/lib/audit-sort";
import { useWallet } from "@/app/hooks/use-wallet";
import type { CollapsibleItem, ContentTab } from "@/db/content";

export type InterpretationTabContentProps = {
  tab: ContentTab<CollapsibleItem>;
  selectedParagraphId: string | null;
};

export function InterpretationTabContent({
  tab,
  selectedParagraphId,
}: InterpretationTabContentProps) {
  const { isConnected } = useWallet();
  const router = useRouter();
  const createHref = selectedParagraphId
    ? `/debate/interpretations/create?paragraphId=${selectedParagraphId}`
    : "/debate/interpretations/create";

  const [openCounts, setOpenCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(tab.items.map((item) => [item.id, item.openCount ?? 0])),
  );

  const {
    items: attestations,
    attest,
    error: attestError,
    isReady: attestReady,
  } = useAttestations(tab.items.map((item) => item.id));

  const [sort, setSort] = useState<AuditSortMode>("newest");
  const attestationCounts = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(attestations).map(([id, state]) => [id, state.count]),
      ),
    [attestations],
  );

  const sortedItems = useMemo(
    () => sortAuditItems(tab.items, sort, { openCounts, attestationCounts }),
    [tab.items, sort, openCounts, attestationCounts],
  );

  async function handleOpen(itemId: string) {
    setOpenCounts((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
    try {
      const response = await fetch(
        `/api/audits/interpretations/${itemId}/open`,
        { method: "POST" },
      );
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }

      const { openCount }: { openCount?: number } = await response.json();
      if (typeof openCount === "number") {
        setOpenCounts((prev) => ({
          ...prev,
          [itemId]: openCount as number,
        }));
      }
    } catch {
      setOpenCounts((prev) => ({
        ...prev,
        [itemId]: Math.max((prev[itemId] ?? 1) - 1, 0),
      }));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <select
          aria-label="Sort items"
          className="select select-bordered select-sm"
          value={sort}
          onChange={(event) => setSort(event.target.value as AuditSortMode)}
        >
          {AUDIT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={!isConnected}
          title={
            isConnected
              ? "Create a new interpretation"
              : "Connect your wallet to create"
          }
          onClick={() => router.push(createHref)}
        >
          Create interpretation
        </button>
      </div>

      <CollapseList
        items={sortedItems}
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
