"use client";

import { useCallback, useState } from "react";
import {
  createWalletClient,
  custom,
  isAddressEqual,
  recoverMessageAddress,
  type Address,
  type EIP1193Provider,
  type Hex,
} from "viem";
import { ensureAnvilChain, type AnvilEthereumProvider } from "@/lib/anvil";
import { useWallet } from "@/app/hooks/use-wallet";
import {
  attestationAbi,
  getAnvilChain,
  getAttestationContractAddress,
  getPublicClient,
  uuidToBytes16,
} from "@/app/hooks/use-attestation";

export type AuditSignKind =
  | "evidence"
  | "contraargument"
  | "fallacy"
  | "source"
  | "interpretation"
  | "report";

export type SignedAudit = {
  signer: Address;
  signature: Hex;
  message: string;
  contentHash: Hex;
};

export type SignPayloadResult =
  | { ok: true; signed: SignedAudit }
  | { ok: false; error: string };

export type UseAuditSignResult = {
  /** "signing" while the wallet prompt is open. */
  phase: "idle" | "signing";
  signPayload: (input: {
    kind: AuditSignKind;
    body: Record<string, unknown>;
  }) => Promise<SignPayloadResult>;
  /**
   * Record a creation signature on-chain after the item was stored.
   * Separate from signing: safe to retry, never blocks the stored item.
   */
  recordSignature: (input: {
    itemId: string;
    contentHash: Hex;
    signature: Hex;
    ipfsCid: string;
  }) => Promise<{ ok: true; txHash: Hex } | { ok: false; error: string }>;
  isConnected: boolean;
};

export const SIGN_MESSAGE_HEADER = "Epistimology audit signature";

/** Stable JSON encoding so the same payload always hashes the same way. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value) ?? "null";
}

export async function sha256Hex(input: string): Promise<Hex> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );

  const bytes = Array.from(new Uint8Array(digest));

  return `0x${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function buildSignMessage(input: {
  kind: AuditSignKind;
  body: Record<string, unknown>;
}): Promise<{ message: string; contentHash: Hex }> {
  const contentHash = await sha256Hex(canonicalJson(input.body));
  const labels = Array.isArray(input.body.labels)
    ? (input.body.labels as unknown[]).map(String).join(", ")
    : undefined;

  const title = String(
    input.body.title ?? labels ?? input.body.label ?? input.kind,
  );

  const message = [
    SIGN_MESSAGE_HEADER,
    `kind: ${input.kind}`,
    `title: ${title}`,
    `contentHash: ${contentHash}`,
  ].join("\n");

  return { message, contentHash };
}

/**
 * Recover the signer of a previously produced audit signature.
 * `valid` compares against `expectedSigner` when given; without it,
 * validity only means the signature recovered structurally.
 */
export async function verifyAuditSignature(input: {
  message: string;
  signature: Hex;
  expectedSigner?: Address;
}): Promise<{ signer: Address; valid: boolean }> {
  const signer = await recoverMessageAddress({
    message: input.message,
    signature: input.signature,
  });
  return {
    signer,
    valid: input.expectedSigner
      ? isAddressEqual(signer, input.expectedSigner)
      : true,
  };
}

/**
 * Request an EIP-191 (`personal_sign`) signature over the exact payload
 * about to be stored. Nothing is posted here — callers must only POST
 * when the result is `{ ok: true }`.
 */
export function useAuditSign(): UseAuditSignResult {
  const { address, isConnected } = useWallet();
  const [phase, setPhase] = useState<"idle" | "signing">("idle");

  const signPayload = useCallback(
    async (input: {
      kind: AuditSignKind;
      body: Record<string, unknown>;
    }): Promise<SignPayloadResult> => {
      const provider: AnvilEthereumProvider | undefined =
        typeof window === "undefined" ? undefined : window.ethereum;
      if (!provider || !address) {
        return { ok: false, error: "Connect your wallet to sign." };
      }
      setPhase("signing");
      try {
        await ensureAnvilChain(provider);
        const { message, contentHash } = await buildSignMessage(input);
        const walletClient = createWalletClient({
          account: address as Address,
          chain: getAnvilChain(),
          transport: custom(provider as EIP1193Provider),
        });
        const signature = await walletClient.signMessage({ message });
        return {
          ok: true,
          signed: {
            signer: address as Address,
            signature,
            message,
            contentHash,
          },
        };
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: unknown }).code === 4001
        ) {
          return { ok: false, error: "Signature rejected in the wallet." };
        }
        return {
          ok: false,
          error:
            error instanceof Error && error.message
              ? error.message
              : "Could not request the signature.",
        };
      } finally {
        setPhase("idle");
      }
    },
    [address],
  );

  const recordSignature = useCallback(
    async (input: {
      itemId: string;
      contentHash: Hex;
      signature: Hex;
      ipfsCid: string;
    }): Promise<{ ok: true; txHash: Hex } | { ok: false; error: string }> => {
      const contract = getAttestationContractAddress();
      if (!contract) {
        return { ok: false, error: "Attestation contract is not configured." };
      }
      if (!input.ipfsCid || typeof input.ipfsCid !== "string") {
        return { ok: false, error: "Missing IPFS CID for the stored item." };
      }
      let key: Hex;
      try {
        key = uuidToBytes16(input.itemId);
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
      const provider: AnvilEthereumProvider | undefined =
        typeof window === "undefined" ? undefined : window.ethereum;
      if (!provider || !address) {
        return { ok: false, error: "Connect your wallet to record." };
      }
      try {
        await ensureAnvilChain(provider);
        const walletClient = createWalletClient({
          account: address as Address,
          chain: getAnvilChain(),
          transport: custom(provider as EIP1193Provider),
        });
        const txHash = await walletClient.writeContract({
          address: contract,
          abi: attestationAbi,
          functionName: "recordSignature",
          args: [key, input.contentHash, input.signature, input.ipfsCid],
        });
        await getPublicClient().waitForTransactionReceipt({ hash: txHash });
        return { ok: true, txHash };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // AlreadyRecorded(bytes16,address) selector is 0x8191741f.
        if (/AlreadyRecorded|0x8191741f/i.test(message)) {
          return { ok: true, txHash: "0x" as Hex };
        }
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: unknown }).code === 4001
        ) {
          return { ok: false, error: "Transaction rejected in the wallet." };
        }
        return {
          ok: false,
          error: message || "Could not record the signature on-chain.",
        };
      }
    },
    [address],
  );

  return { phase, signPayload, recordSignature, isConnected };
}
