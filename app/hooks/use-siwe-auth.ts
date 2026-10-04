"use client";

import { useCallback, useEffect, useState } from "react";
import { ANVIL_CHAIN_ID_DEC, type AnvilEthereumProvider } from "@/lib/anvil";
import {
  siweNonceResponseSchema,
  siweSessionSchema,
  siweVerifyResponseSchema,
} from "@/lib/siwe";

export type SiweAuthStatus =
  | "anonymous"
  | "signing"
  | "verifying"
  | "authenticated";

export type UseSiweAuthResult = {
  status: SiweAuthStatus;
  address: string | null;
  chainId: number | null;
  error: string | null;
  /**
   * Run the SIWE flow for an already-connected wallet: fetch a nonce,
   * ask the wallet to sign it, then verify server-side (JWT cookie).
   * Resolves `true` when the session was created.
   */
  signIn: (input: {
    address: string;
    chainId?: number;
    provider: AnvilEthereumProvider;
  }) => Promise<boolean>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return fallback;
}

/**
 * Client-side SIWE session. Keeps all auth logic out of components:
 * `SiteNavbar` only reads `status`/`address` and calls `signIn`/`signOut`.
 */
export function useSiweAuth(): UseSiweAuthResult {
  const [status, setStatus] = useState<SiweAuthStatus>("anonymous");
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applySession = useCallback((body: unknown) => {
    const parsed = siweSessionSchema.safeParse(body);
    if (!parsed.success) {
      setStatus("anonymous");
      setAddress(null);
      setChainId(null);
      return;
    }
    setStatus("authenticated");
    setAddress(parsed.data.address);
    setChainId(parsed.data.chainId);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    let response: Response;
    try {
      response = await fetch("/api/auth/me");
    } catch {
      return;
    }
    if (!response.ok) {
      setStatus("anonymous");
      setAddress(null);
      setChainId(null);
      return;
    }
    applySession(await readJson(response));
  }, [applySession]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((response) =>
        response.ok ? response.json().catch(() => null) : null,
      )
      .then((body) => {
        if (!cancelled) {
          applySession(body);
        }
      })
      .catch(() => {
        // Session restore is best-effort; stay anonymous.
      });
    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const signIn = useCallback(
    async (input: {
      address: string;
      chainId?: number;
      provider: AnvilEthereumProvider;
    }): Promise<boolean> => {
      const targetChainId = input.chainId ?? ANVIL_CHAIN_ID_DEC;
      setStatus("signing");
      setError(null);
      try {
        const nonceResponse = await fetch("/api/auth/nonce", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            address: input.address,
            chainId: targetChainId,
          }),
        });
        const nonceBody = await readJson(nonceResponse);
        const nonceParsed = siweNonceResponseSchema.safeParse(nonceBody);
        if (!nonceResponse.ok || !nonceParsed.success) {
          throw new Error(
            errorMessage(nonceBody, "Could not start the sign-in."),
          );
        }
        let signature: unknown;
        try {
          signature = await input.provider.request({
            method: "personal_sign",
            params: [nonceParsed.data.message, input.address],
          });
        } catch (signError) {
          if (
            typeof signError === "object" &&
            signError !== null &&
            "code" in signError &&
            (signError as { code?: unknown }).code === 4001
          ) {
            throw new Error("Signature rejected in the wallet.");
          }
          throw new Error("Could not request the signature.");
        }
        if (typeof signature !== "string") {
          throw new Error("Wallet returned an invalid signature.");
        }
        setStatus("verifying");
        const verifyResponse = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            message: nonceParsed.data.message,
            signature,
          }),
        });
        const verifyBody = await readJson(verifyResponse);
        const verifyParsed = siweVerifyResponseSchema.safeParse(verifyBody);
        if (!verifyResponse.ok || !verifyParsed.success) {
          throw new Error(
            errorMessage(verifyBody, "Sign-in verification failed."),
          );
        }
        setStatus("authenticated");
        setAddress(verifyParsed.data.address);
        setChainId(verifyParsed.data.chainId);
        return true;
      } catch (signInError) {
        setStatus("anonymous");
        setAddress(null);
        setChainId(null);
        setError(
          signInError instanceof Error && signInError.message
            ? signInError.message
            : "Sign-in failed.",
        );
        return false;
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Cookie cleanup is best-effort; always reset local state.
    }
    setStatus("anonymous");
    setAddress(null);
    setChainId(null);
    setError(null);
  }, []);

  return { status, address, chainId, error, signIn, signOut, refresh };
}
