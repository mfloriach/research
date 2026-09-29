"use client";

import type { Address, Hex } from "viem";

export type SignaturePanelProps = {
  /** Human label, e.g. "evidence" or "report". */
  kindLabel: string;
  signer: Address;
  signature: Hex;
  contentHash: Hex;
  /**
   * Non-blocking warning, e.g. when on-chain signature recording failed.
   * The item itself is already stored when this is set.
   */
  recordWarning?: string | null;
  onContinue: () => void;
};

function truncate(value: string): string {
  if (value.length <= 20) {
    return value;
  }
  return `${value.slice(0, 12)}…${value.slice(-8)}`;
}

/**
 * Success panel shown after an audit payload was signed and stored.
 * The signature is display-only: it is never sent to the backend.
 */
export function SignaturePanel({
  kindLabel,
  signer,
  signature,
  contentHash,
  recordWarning,
  onContinue,
}: SignaturePanelProps) {
  return (
    <div className="mt-6 rounded-box border border-success/40 bg-success/5 p-4 sm:p-6">
      <p className="flex items-center gap-2 text-sm font-semibold text-success">
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        {kindLabel} signed and stored
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
          <dt className="w-28 shrink-0 font-medium opacity-70">Signer</dt>
          <dd className="break-all font-mono text-xs" title={signer}>
            {truncate(signer)}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
          <dt className="w-28 shrink-0 font-medium opacity-70">Signature</dt>
          <dd className="break-all font-mono text-xs" title={signature}>
            {truncate(signature)}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
          <dt className="w-28 shrink-0 font-medium opacity-70">Content hash</dt>
          <dd className="break-all font-mono text-xs" title={contentHash}>
            {truncate(contentHash)}
          </dd>
        </div>
      </dl>
      <div className="mt-4">
        {recordWarning ? (
          <p role="alert" className="mb-3 text-xs text-warning">
            Stored, but the signature was not recorded on-chain: {recordWarning}
          </p>
        ) : null}
        <button type="button" className="btn btn-primary" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
