"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ANVIL_CHAIN_ID_HEX,
  ensureAnvilChain,
  getAnvilAccountsViaRpc,
  isAnvilReachable,
  type AnvilEthereumProvider,
} from "@/lib/anvil";
import { Search, type SearchResults } from "./search";
import { config } from "@/lib/config";

/**
 * Account dropdown entries. Hardcoded: there is no menu_items collection.
 */
const MENU_LABEL = "Account menu";

const MENU_ITEMS: ReadonlyArray<{ id: string; label: string; href: string }> = [
  { id: "profile", label: "Profile", href: "#profile" },
  { id: "settings", label: "Settings", href: "#settings" },
  { id: "sign-out", label: "Sign out", href: "#sign-out" },
];

type EthereumProvider = AnvilEthereumProvider;

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export type SiteNavbarProps = {
  brand: string;
  search: {
    placeholder: string;
    label: string;
  };
  avatar: {
    src: string;
    alt: string;
  };
  connect?: {
    label: string;
    connectingLabel?: string;
    noWalletMessage?: string;
  };
  disconnect?: {
    label?: string;
    disconnectingLabel?: string;
  };
  walletAddress?: string | null;
  onConnect?: (address: string | null) => void;
  onDisconnect?: () => void;
};

/**
 * Top navigation bar: brand, search field and wallet-gated account UI.
 *
 * If a wallet is connected to the local Anvil chain, renders the avatar
 * dropdown menu. Otherwise renders a connect button that switches the
 * injected EIP-1193 provider to Anvil (`http://127.0.0.1:8545`, chain 31337)
 * and requests accounts. When no injected wallet exists, it falls back to
 * Anvil's unlocked accounts over direct JSON-RPC (local dev only).
 */
export function SiteNavbar({
  brand,
  search,
  avatar,
  connect = { label: "Connect wallet" },
  disconnect = {},
  walletAddress,
  onConnect,
  onDisconnect,
}: SiteNavbarProps) {
  const [query, setQuery] = useState("");
  const [internalAddress, setInternalAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults>(null);
  const titlesCache = useRef<Map<string, string> | null>(null);

  async function fetchArticleTitles(): Promise<Map<string, string>> {
    if (titlesCache.current) {
      return titlesCache.current;
    }
    const titles = new Map<string, string>();
    try {
      const response = await fetch("/api/content");
      if (response.ok) {
        const data = (await response.json()) as {
          reportingCard: {
            tabs: { items: { id: string; title: string }[] }[];
          };
        };
        for (const tab of data.reportingCard.tabs) {
          for (const item of tab.items) {
            titles.set(item.id, item.title);
          }
        }
      }
    } catch {
      // Titles are a progressive enhancement; fall back to IDs.
    }
    titlesCache.current = titles;
    return titles;
  }

  async function handleSearchSubmit(value: string) {
    const query = value.trim();
    if (query === "") {
      return;
    }
    setSearchStatus("loading");
    setSearchError(null);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      const data = (await response.json()) as {
        matches: { articleId: string; score: number }[];
        answer: string;
        model: string;
      };
      const titles = await fetchArticleTitles();
      setSearchResults({
        matches: data.matches.map((match) => ({
          articleId: match.articleId,
          title: titles.get(match.articleId) ?? match.articleId,
          score: match.score,
        })),
        answer: data.answer,
        model: data.model,
      });
      setSearchStatus("done");
    } catch {
      setSearchStatus("error");
      setSearchError("Search failed. Check the query and try again.");
    }
  }

  const address = walletAddress !== undefined ? walletAddress : internalAddress;
  const isOnAnvil =
    chainId === null || chainId.toLowerCase() === ANVIL_CHAIN_ID_HEX;
  const isConnected = address !== null && address !== "" && isOnAnvil;

  useEffect(() => {
    if (walletAddress !== undefined) {
      return;
    }
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
        if (first) {
          setInternalAddress(first);
          onConnect?.(first);
        }
      })
      .catch(() => {
        // Restoring the session is best-effort; stay disconnected.
      });

    const handleAccountsChanged = (...args: unknown[]) => {
      const [accounts] = args as [string[]?];
      const [next] = accounts ?? [];
      setInternalAddress(next ?? null);
      onConnect?.(next ?? null);
    };
    const handleChainChanged = (...args: unknown[]) => {
      const [nextChainId] = args as [string?];
      setChainId(typeof nextChainId === "string" ? nextChainId : null);
    };
    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);
    return () => {
      cancelled = true;
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [walletAddress, onConnect]);

  function setConnectedAddress(next: string | null) {
    if (walletAddress === undefined) {
      setInternalAddress(next);
    }
    onConnect?.(next);
  }

  async function connectViaInjected(provider: EthereumProvider) {
    await ensureAnvilChain(provider);
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    const [first] = accounts ?? [];
    if (!first) {
      throw new Error("No accounts returned by the wallet.");
    }
    const currentChainId = (await provider
      .request({ method: "eth_chainId" })
      .catch(() => null)) as string | null;
    if (typeof currentChainId === "string") {
      setChainId(currentChainId);
      if (currentChainId.toLowerCase() !== ANVIL_CHAIN_ID_HEX) {
        throw new Error("Wallet did not switch to Anvil (chain 31337).");
      }
    }
    setConnectedAddress(first);
  }

  async function connectViaAnvilRpc() {
    const reachable = await isAnvilReachable();
    if (!reachable) {
      throw new Error(
        `Anvil is not reachable at ${config.anvilRpcUrl}. Start it with \`anvil\`.`,
      );
    }
    const accounts = await getAnvilAccountsViaRpc();
    const [first] = accounts ?? [];
    if (!first) {
      throw new Error("Anvil returned no accounts.");
    }
    setChainId(ANVIL_CHAIN_ID_HEX);
    setConnectedAddress(first);
  }

  async function handleConnect() {
    setConnecting(true);
    setConnectError(null);
    try {
      const provider = window.ethereum;
      if (provider) {
        await connectViaInjected(provider);
      } else {
        await connectViaAnvilRpc();
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        setConnectError(error.message);
      } else if (!window.ethereum) {
        setConnectError(
          connect.noWalletMessage ??
            "No wallet found. Install MetaMask or start Anvil locally.",
        );
      } else {
        setConnectError("Connection request was rejected.");
      }
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const provider = window.ethereum;
      if (provider) {
        // MetaMask supports revoking account access; other wallets may not.
        await provider
          .request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          })
          .catch(() => null);
      }
    } finally {
      setConnectedAddress(null);
      setConnectError(null);
      setDisconnecting(false);
      onDisconnect?.();
    }
  }

  function truncateAddress(value: string): string {
    if (value.length <= 10) {
      return value;
    }
    return `${value.slice(0, 6)}…${value.slice(-4)}`;
  }

  return (
    <header className="navbar sticky top-0 z-40 bg-base-100 px-4 shadow-sm sm:px-6">
      <div className="navbar-start">
        <a className="btn btn-ghost px-2 text-lg sm:text-xl">{brand}</a>
      </div>

      <div className="navbar-end gap-2">
        <Search
          query={query}
          setQuery={setQuery}
          search={search}
          status={searchStatus}
          results={searchResults}
          error={searchError}
          onSubmitSearch={handleSearchSubmit}
        />

        {isConnected ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <Image
                  src={avatar.src}
                  alt={avatar.alt}
                  width={40}
                  height={40}
                />
              </div>
            </div>
            <ul
              tabIndex={-1}
              className="menu dropdown-content z-1 mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li>
                <span className="menu-title">{MENU_LABEL}</span>
              </li>
              {address ? (
                <li>
                  <span
                    className="font-mono text-xs opacity-70"
                    title={address}
                    aria-label={`Connected wallet ${address}`}
                  >
                    {truncateAddress(address)}
                  </span>
                </li>
              ) : null}
              {MENU_ITEMS.map((item) => (
                <li key={item.id}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
              <div className="divider my-1" aria-hidden="true" />
              <li>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="text-error"
                >
                  {disconnecting
                    ? (disconnect.disconnectingLabel ?? "Disconnecting…")
                    : (disconnect.label ?? "Disconnect")}
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting
                ? (connect.connectingLabel ?? "Connecting…")
                : connect.label}
            </button>
            {connectError ? (
              <p role="alert" className="text-xs text-error">
                {connectError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
