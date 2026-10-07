"use client";

import type { SyntheticEvent } from "react";
import { EyeIcon, ShieldCheckIcon } from "@/components/icons";

export type CollapseCardProps = {
  title: string;
  paragraphs: readonly string[];
  author?: string;
  date?: string;
  openCount?: number;
  onOpen?: () => void;
  /** On-chain attestation count, or null/undefined while unavailable. */
  attestationCount?: number | null;
  /** Whether the connected wallet already attested this item. */
  hasAttested?: boolean;
  /** An attestation transaction is in flight for this item. */
  attesting?: boolean;
  /** Wallet is connected and the attestation contract is configured. */
  canAttest?: boolean;
  onAttest?: () => void;
};

/**
 * daisyUI collapse card.
 *
 * Built on `<details>`; the title is clamped to two lines while collapsed —
 * the clamp is released once opened via the `group-open:` variant.
 * `collapse-arrow` renders the chevron that `.collapse-title` reserves its
 * inline-end padding for. Optionally reports opens and shows an eye icon
 * with the open count on the right side of the header.
 */
export function CollapseCard({
  title,
  paragraphs,
  author,
  date,
  openCount,
  onOpen,
  attestationCount,
  hasAttested,
  attesting,
  canAttest,
  onAttest,
}: CollapseCardProps) {
  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if ((event.nativeEvent as ToggleEvent).newState === "open") {
      onOpen?.();
    }
  }

  function handleAttest(event: SyntheticEvent<HTMLButtonElement>) {
    // The button lives inside <summary>: don't toggle the card on click.
    event.preventDefault();
    event.stopPropagation();
    onAttest?.();
  }

  const attestTitle = hasAttested
    ? "Attested by this wallet"
    : canAttest
      ? "Attest this item on-chain"
      : "Connect your wallet to attest";

  return (
    <details className="dossier-card group collapse border border-base-300 bg-base-100 transition-shadow duration-300 open:border-primary/30 hover:shadow-md" onToggle={handleToggle}>
      <summary className="collapse-title flex items-center gap-2 text-sm font-medium leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <span className="line-clamp-2 flex-1 font-medium tracking-tight text-balance transition-colors group-hover:text-primary group-open:line-clamp-none">{title}</span>
        {typeof openCount === "number" ? (
          <span
            className="flex shrink-0 items-center gap-1 text-xs font-normal text-base-content/60"
            title={`${openCount} ${openCount === 1 ? "open" : "opens"}`}
          >
            <EyeIcon />
            <span aria-label={`${openCount} opens`}>{openCount}</span>
          </span>
        ) : null}
        {onAttest ? (
          <button
            type="button"
            onClick={handleAttest}
            disabled={!canAttest || attesting || hasAttested}
            title={attestTitle}
            aria-label={attestTitle}
            className={`btn btn-ghost btn-xs shrink-0 gap-1 px-1.5 font-normal transition-transform active:scale-95 ${
              hasAttested ? "text-success" : "text-base-content/60"
            }`}
          >
            {attesting ? (
              <span className="loading loading-spinner loading-xs" aria-hidden="true" />
            ) : (
              <ShieldCheckIcon filled={hasAttested} />
            )}
            {typeof attestationCount === "number" ? (
              <span aria-label={`${attestationCount} attestations`}>
                {attestationCount}
              </span>
            ) : null}
          </button>
        ) : null}
      </summary>
      <div className="collapse-content">
        <div className="space-y-3 text-sm leading-7 text-base-content/85">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {(author ?? date) && (
          <p className="mt-3 text-xs text-base-content/60">
            {author && <span>By {author}</span>}
            {author && date && <span aria-hidden="true"> · </span>}
            {date && (
              <time dateTime={date}>
                {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            )}
          </p>
        )}
      </div>
    </details>
  );
}
