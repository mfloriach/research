"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  http,
  type Address,
  type EIP1193Provider,
  type Hex,
} from "viem";
import { ensureAnvilChain, type AnvilEthereumProvider } from "@/lib/anvil";
import { config } from "@/lib/config";
import { useWallet } from "@/app/hooks/use-wallet";

export const attestationAbi = [
  {
    type: "function",
    name: "attest",
    stateMutability: "nonpayable",
    inputs: [{ name: "itemId", type: "bytes16" }],
    outputs: [],
  },
  {
    type: "function",
    name: "attestationCount",
    stateMutability: "view",
    inputs: [{ name: "itemId", type: "bytes16" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "hasAttested",
    stateMutability: "view",
    inputs: [
      { name: "itemId", type: "bytes16" },
      { name: "account", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "event",
    name: "Attested",
    inputs: [
      { name: "itemId", type: "bytes16", indexed: true },
      { name: "attester", type: "address", indexed: true },
    ],
  },
  {
    type: "function",
    name: "recordSignature",
    stateMutability: "nonpayable",
    inputs: [
      { name: "itemId", type: "bytes16" },
      { name: "contentHash", type: "bytes32" },
      { name: "signature", type: "bytes" },
      { name: "ipfsCid", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "signatureContentHash",
    stateMutability: "view",
    inputs: [
      { name: "itemId", type: "bytes16" },
      { name: "account", type: "address" },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "hasRecordedSignature",
    stateMutability: "view",
    inputs: [
      { name: "itemId", type: "bytes16" },
      { name: "account", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "itemIpfsCid",
    stateMutability: "view",
    inputs: [
      { name: "itemId", type: "bytes16" },
      { name: "account", type: "address" },
    ],
    outputs: [{ type: "string" }],
  },
  {
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
] as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Audit item IDs are UUIDs; the registry keys attestations by bytes16,
 * so the 16 UUID bytes are packed directly (dashes stripped).
 */
export function uuidToBytes16(itemId: string): Hex {
  if (!UUID_PATTERN.test(itemId)) {
    throw new Error(`Not an attestable UUID item ID: "${itemId}"`);
  }
  return `0x${itemId.replace(/-/g, "").toLowerCase()}`;
}

export function getAttestationContractAddress(): Address | null {
  const raw = config.attestationContractAddress;
  if (!raw) {
    return null;
  }
  return /^0x[0-9a-fA-F]{40}$/.test(raw) ? (raw as Address) : null;
}

export function getAnvilChain() {
  return defineChain({
    id: 31337,
    name: "Anvil Local",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [config.anvilRpcUrl] } },
  });
}

export function getPublicClient() {
  return createPublicClient({
    chain: getAnvilChain(),
    transport: http(config.anvilRpcUrl),
  });
}

export type AttestationItemState = {
  /** On-chain count, or null while unloaded/unavailable. */
  count: number | null;
  hasAttested: boolean;
  pending: boolean;
};

export type UseAttestationsResult = {
  items: Record<string, AttestationItemState>;
  attest: (itemId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  /** False when the contract address is not configured. */
  isReady: boolean;
  isConnected: boolean;
};

type LoadedValues = Record<string, { count: number; hasAttested: boolean }>;

function describeAttestError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  // AlreadyAttested(bytes16,address) selector is 0x7d9995d6.
  if (/AlreadyAttested|0x7d9995d6/i.test(message)) {
    return "This wallet already attested this item.";
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 4001
  ) {
    return "Transaction rejected in the wallet.";
  }
  if (/not configured|connect your wallet|not an attestable/i.test(message)) {
    return message;
  }
  return "Attestation failed. Make sure Anvil is running and try again.";
}

function mergeItemState(
  id: string,
  loaded: { key: string; values: LoadedValues } | null,
  idsKey: string,
  pendingIds: readonly string[],
): AttestationItemState {
  const current = loaded?.key === idsKey ? loaded.values[id] : undefined;
  return {
    count: current?.count ?? null,
    hasAttested: current?.hasAttested ?? false,
    pending: pendingIds.includes(id),
  };
}

/**
 * On-chain attestation state for a set of audit item IDs.
 * Reads counts via public RPC; writes go through the injected wallet.
 * State updates happen only in async continuations and event handlers.
 */
export function useAttestations(
  itemIds: readonly string[],
): UseAttestationsResult {
  const { address, isConnected } = useWallet();
  const contract = useMemo(() => getAttestationContractAddress(), []);
  const [loaded, setLoaded] = useState<{
    key: string;
    values: LoadedValues;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<readonly string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const idsKey = useMemo(() => [...itemIds].sort().join(","), [itemIds]);
  const ids = useMemo(() => (idsKey === "" ? [] : idsKey.split(",")), [idsKey]);

  useEffect(() => {
    if (!contract || ids.length === 0) {
      return;
    }
    let cancelled = false;
    const client = getPublicClient();
    const targets = ids.filter((id) => {
      try {
        uuidToBytes16(id);
        return true;
      } catch {
        return false;
      }
    });
    Promise.all(
      targets.map(async (id): Promise<[string, LoadedValues[string]]> => {
        const key = uuidToBytes16(id);
        const [count, attested] = await Promise.all([
          client.readContract({
            address: contract,
            abi: attestationAbi,
            functionName: "attestationCount",
            args: [key],
          }),
          address
            ? client.readContract({
                address: contract,
                abi: attestationAbi,
                functionName: "hasAttested",
                args: [key, address as Address],
              })
            : Promise.resolve(false),
        ]);
        return [id, { count: Number(count), hasAttested: attested }];
      }),
    ).then(
      (entries) => {
        if (cancelled) {
          return;
        }
        setLoadError(null);
        setLoaded({ key: idsKey, values: Object.fromEntries(entries) });
      },
      () => {
        if (cancelled) {
          return;
        }
        setLoadError(
          "Could not load attestations. Make sure Anvil is running.",
        );
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, contract, address]);

  const loading = Boolean(contract) && ids.length > 0 && loaded?.key !== idsKey;

  const items = useMemo(
    () =>
      Object.fromEntries(
        ids.map((id) => [id, mergeItemState(id, loaded, idsKey, pendingIds)]),
      ),
    [ids, loaded, idsKey, pendingIds],
  );

  const attest = useCallback(
    async (itemId: string) => {
      setActionError(null);
      if (!contract) {
        setActionError("Attestation contract is not configured.");
        return;
      }
      let key: Hex;
      try {
        key = uuidToBytes16(itemId);
      } catch (error) {
        setActionError(error instanceof Error ? error.message : String(error));
        return;
      }
      const provider: AnvilEthereumProvider | undefined =
        typeof window === "undefined" ? undefined : window.ethereum;
      if (!provider || !address) {
        setActionError("Connect your wallet to attest.");
        return;
      }
      setPendingIds((prev) =>
        prev.includes(itemId) ? prev : [...prev, itemId],
      );
      try {
        await ensureAnvilChain(provider);
        const walletClient = createWalletClient({
          account: address as Address,
          chain: getAnvilChain(),
          transport: custom(provider as EIP1193Provider),
        });
        const hash = await walletClient.writeContract({
          address: contract,
          abi: attestationAbi,
          functionName: "attest",
          args: [key],
        });
        await getPublicClient().waitForTransactionReceipt({ hash });
        const client = getPublicClient();
        const [count, attested] = await Promise.all([
          client.readContract({
            address: contract,
            abi: attestationAbi,
            functionName: "attestationCount",
            args: [key],
          }),
          client.readContract({
            address: contract,
            abi: attestationAbi,
            functionName: "hasAttested",
            args: [key, address as Address],
          }),
        ]);
        const fresh = { count: Number(count), hasAttested: attested };
        setLoaded((prev) =>
          prev?.key === idsKey
            ? { key: prev.key, values: { ...prev.values, [itemId]: fresh } }
            : { key: idsKey, values: { [itemId]: fresh } },
        );
      } catch (thrown) {
        const message = describeAttestError(thrown);
        // A double-attest revert still means the wallet attested: reflect it.
        if (/already attested/i.test(message)) {
          setLoaded((prev) => {
            const prior =
              prev?.key === idsKey ? prev.values[itemId] : undefined;
            return {
              key: idsKey,
              values: {
                ...(prev?.key === idsKey ? prev.values : {}),
                [itemId]: { count: prior?.count ?? 0, hasAttested: true },
              },
            };
          });
        }
        setActionError(message);
      } finally {
        setPendingIds((prev) => prev.filter((id) => id !== itemId));
      }
    },
    [contract, address, idsKey],
  );

  const clearError = useCallback(() => {
    setActionError(null);
    setLoadError(null);
  }, []);

  return {
    items,
    attest,
    loading,
    error: actionError ?? loadError,
    clearError,
    isReady: contract !== null,
    isConnected,
  };
}
