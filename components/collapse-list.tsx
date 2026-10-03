import { CollapseCard } from "@/components/collapse-card";
import type { AttestationItemState } from "@/app/hooks/use-attestation";
import type { CollapsibleItem } from "@/db/nuclear";

export type CollapseListProps = {
  items: readonly CollapsibleItem[];
  openCounts?: Readonly<Record<string, number>>;
  onOpen?: (itemId: string) => void;
  attestations?: Readonly<Record<string, AttestationItemState>>;
  onAttest?: (itemId: string) => void;
  canAttest?: boolean;
};

/** Renders a tab's worth of collapse cards. */
export function CollapseList({
  items,
  openCounts,
  onOpen,
  attestations,
  onAttest,
  canAttest,
}: CollapseListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const attestation = attestations?.[item.id];
        return (
          <CollapseCard
            key={item.id}
            title={item.title}
            paragraphs={item.paragraphs}
            author={item.author}
            date={item.date}
            openCount={openCounts?.[item.id] ?? item.openCount}
            onOpen={onOpen ? () => onOpen(item.id) : undefined}
            attestationCount={attestation?.count ?? null}
            hasAttested={attestation?.hasAttested ?? false}
            attesting={attestation?.pending ?? false}
            canAttest={canAttest ?? false}
            onAttest={onAttest ? () => onAttest(item.id) : undefined}
          />
        );
      })}
    </div>
  );
}
