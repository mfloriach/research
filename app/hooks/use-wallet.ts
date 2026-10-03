"use client";

import { useEffect, useState } from "react";
import { ANVIL_CHAIN_ID_HEX, type AnvilEthereumProvider } from "@/lib/anvil";

declare global {
  interface Window {
    ethereum?: AnvilEthereumProvider;
  }
}

export type WalletState = {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
};

/**
 * Read-only wallet detection shared by pages that need to gate UI
 * (e.g. disable "create" when no wallet is connected).
 * Connecting itself stays in `SiteNavbar`.
 */
export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) {
      return;
    }
    let cancelled = false;
    Promise.all([
      provider.request({ method: "eth_accounts" }),
      provider.request({ method: "eth_chainId" }).catch(() => null),
    ])
      .then(([accounts, currentChainId]) => {
        if (cancelled) {
          return;
        }
        const [first] = ((accounts ?? []) as string[]) ?? [];
        if (typeof currentChainId === "string") {
          setChainId(currentChainId);
        }
        setAddress(first ?? null);
      })
      .catch(() => {
        // Best-effort restore; stay disconnected.
      });

    const handleAccountsChanged = (...args: unknown[]) => {
      const [accounts] = args as [string[]?];
      const [next] = accounts ?? [];
      if (!cancelled) {
        setAddress(next ?? null);
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const [nextChainId] = args as [string?];
      if (!cancelled) {
        setChainId(typeof nextChainId === "string" ? nextChainId : null);
      }
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    return () => {
      cancelled = true;
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const isOnAnvil =
    chainId === null || chainId.toLowerCase() === ANVIL_CHAIN_ID_HEX;

  return {
    address,
    chainId,
    isConnected: address !== null && address !== "" && isOnAnvil,
  };
}
