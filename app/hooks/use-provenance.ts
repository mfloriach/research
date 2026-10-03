"use client";

import { useEffect, useMemo, useState } from "react";
import { isAddress, type Address, type Hash, type Hex } from "viem";
import {
  getAttestationContractAddress,
  getPublicClient,
} from "@/app/hooks/use-attestation";

export type ProvenanceEntryKind = "signature" | "attestation";

export type ProvenanceEntry = {
  kind: ProvenanceEntryKind;
  /** Audit item or article ID as UUID. */
  itemId: string;
  /** Only on signature entries. */
  contentHash?: Hex;
  /** Only on signature entries. */
  signature?: Hex;
  /** Only on signature entries. */
  ipfsCid?: string;
  attester: Address;
  txHash: Hash;
  blockNumber: bigint;
  logIndex: number;
  /** Unix milliseconds, or null when the block is unavailable. */
  timestamp: number | null;
};

export type UseProvenanceResult = {
  entries: ProvenanceEntry[];
  loading: boolean;
  error: string | null;
};

/** bytes16 (32 hex chars) back to UUID `8-4-4-4-12` form. */
export function bytes16ToUuid(value: string): string {
  const hex = value.toLowerCase().startsWith("0x")
    ? value.toLowerCase().slice(2)
    : value.toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) {
    throw new Error(`Not a bytes16 item ID: "${value}"`);
  }
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

async function loadProvenance(
  attester: Address,
  contract: Address,
): Promise<ProvenanceEntry[]> {
  const client = getPublicClient();
  const [attestedLogs, signatureLogs] = await Promise.all([
    client.getLogs({
      address: contract,
      event: {
        type: "event",
        name: "Attested",
        inputs: [
          { name: "itemId", type: "bytes16", indexed: true },
          { name: "attester", type: "address", indexed: true },
        ],
      },
      args: { attester },
      fromBlock: BigInt(0),
    }),
    client.getLogs({
      address: contract,
      event: {
        type: "event",
        name: "ItemProvenance",
        inputs: [
          { name: "itemId", type: "bytes16", indexed: true },
          { name: "attester", type: "address", indexed: true },
          { name: "contentHash", type: "bytes32", indexed: false },
          { name: "signature", type: "bytes", indexed: false },
          { name: "ipfsCid", type: "string", indexed: false },
        ],
      },
      args: { attester },
      fromBlock: BigInt(0),
    }),
  ]);

  const entries: ProvenanceEntry[] = [
    ...attestedLogs.map((log) => ({
      kind: "attestation" as const,
      itemId: bytes16ToUuid(log.args.itemId as string),
      attester: log.args.attester as Address,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
      timestamp: null as number | null,
    })),
    ...signatureLogs.map((log) => ({
      kind: "signature" as const,
      itemId: bytes16ToUuid(log.args.itemId as string),
      contentHash: log.args.contentHash as Hex,
      signature: log.args.signature as Hex,
      ipfsCid: log.args.ipfsCid as string,
      attester: log.args.attester as Address,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
      timestamp: null as number | null,
    })),
  ];
  entries.sort((a, b) =>
    a.blockNumber === b.blockNumber
      ? a.logIndex - b.logIndex
      : Number(a.blockNumber - b.blockNumber),
  );

  const blockNumbers = [...new Set(entries.map((entry) => entry.blockNumber))];
  const timestamps = new Map<bigint, number>();
  await Promise.all(
    blockNumbers.map(async (blockNumber) => {
      try {
        const block = await client.getBlock({ blockNumber });
        timestamps.set(blockNumber, Number(block.timestamp) * 1000);
      } catch {
        // Leave timestamp null; ordering still holds via block/log index.
      }
    }),
  );
  for (const entry of entries) {
    entry.timestamp = timestamps.get(entry.blockNumber) ?? null;
  }
  return entries;
}

/**
 * Provenance timeline for a wallet: its signatures and attestations in
 * creation (block/log) order. Pass `null` to skip fetching.
 * Uses the shared attestation ABI only as a type/ABI source.
 */
export function useProvenance(wallet: string | null): UseProvenanceResult {
  const contract = useMemo(() => getAttestationContractAddress(), []);
  const [result, setResult] = useState<{
    key: string;
    entries: ProvenanceEntry[];
  } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const normalized = wallet?.trim() ?? "";
  const valid = normalized !== "" && isAddress(normalized);

  useEffect(() => {
    if (!contract) {
      return;
    }
    if (normalized === "" || !isAddress(normalized)) {
      return;
    }
    const key = normalized.toLowerCase();
    let cancelled = false;
    loadProvenance(normalized as Address, contract).then(
      (entries) => {
        if (cancelled) {
          return;
        }
        setFetchError(null);
        setResult({ key, entries });
      },
      () => {
        if (cancelled) {
          return;
        }
        setFetchError("Could not load provenance. Make sure Anvil is running.");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [normalized, contract]);

  const error = !contract
    ? "Attestation contract is not configured."
    : normalized !== "" && !valid
      ? "Invalid wallet address."
      : fetchError;

  const loading =
    Boolean(contract) && valid && result?.key !== normalized.toLowerCase();

  const entries =
    valid && result?.key === normalized.toLowerCase() ? result.entries : [];

  return { entries, loading, error };
}
