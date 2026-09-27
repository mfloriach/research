"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type SiteNavbarMenuItem = {
  id: string;
  label: string;
  href: string;
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

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
  menu: {
    label: string;
    items: SiteNavbarMenuItem[];
  };
  connect?: {
    label: string;
    connectingLabel?: string;
    noWalletMessage?: string;
  };
  walletAddress?: string | null;
  onConnect?: (address: string | null) => void;
};

/**
 * Top navigation bar: brand, search field and wallet-gated account UI.
 *
 * If a wallet is connected, renders the avatar dropdown menu.
 * Otherwise renders a connect button that requests accounts from the
 * injected EIP-1193 provider (`window.ethereum`).
 */
export function SiteNavbar({
  brand,
  search,
  avatar,
  menu,
  connect = { label: "Connect wallet" },
  walletAddress,
  onConnect,
}: SiteNavbarProps) {
  const [query, setQuery] = useState("");
  const [internalAddress, setInternalAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim() === "") {
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`).catch(() => {
        // Search logging is best-effort; ignore network errors.
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const address = walletAddress !== undefined ? walletAddress : internalAddress;
  const isConnected = address !== null && address !== "";

  useEffect(() => {
    if (walletAddress !== undefined) {
      return;
    }
    const provider = window.ethereum;
    if (!provider) {
      return;
    }
    let cancelled = false;
    provider
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (cancelled) {
          return;
        }
        const [first] = (accounts ?? []) as string[];
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
    provider.on?.("accountsChanged", handleAccountsChanged);
    return () => {
      cancelled = true;
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [walletAddress, onConnect]);

  async function handleConnect() {
    const provider = window.ethereum;
    if (!provider) {
      setConnectError(connect.noWalletMessage ?? "No wallet found. Install MetaMask or another wallet.");
      return;
    }
    setConnecting(true);
    setConnectError(null);
    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      const [first] = accounts ?? [];
      if (!first) {
        setConnectError("No accounts returned by the wallet.");
        return;
      }
      if (walletAddress === undefined) {
        setInternalAddress(first);
      }
      onConnect?.(first);
    } catch {
      setConnectError("Connection request was rejected.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <header className="navbar sticky top-0 z-40 bg-base-100 px-4 shadow-sm sm:px-6">
      <div className="navbar-start">
        <a className="btn btn-ghost px-2 text-lg sm:text-xl">{brand}</a>
      </div>

      <div className="navbar-end gap-2">
        <label className="input w-36 sm:w-72">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </g>
          </svg>
          <input
            type="search"
            required
            placeholder={search.placeholder}
            aria-label={search.label}
            className="grow"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        {isConnected ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <Image src={avatar.src} alt={avatar.alt} width={40} height={40} />
              </div>
            </div>
            <ul
              tabIndex={-1}
              className="menu dropdown-content z-1 mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li>
                <span className="menu-title">{menu.label}</span>
              </li>
              {menu.items.map((item) => (
                <li key={item.id}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
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
              {connecting ? (connect.connectingLabel ?? "Connecting…") : connect.label}
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
