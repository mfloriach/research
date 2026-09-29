"use client";

import { useState } from "react";
import { useWallet } from "@/app/hooks/use-wallet";
import { useProvenance } from "@/app/hooks/use-provenance";
import { ipfsGatewayUrl } from "@/lib/ipfs-gateway";

function truncate(value: string): string {
  if (value.length <= 20) {
    return value;
  }
  return `${value.slice(0, 12)}…${value.slice(-8)}`;
}

function formatTime(timestamp: number | null): string {
  if (timestamp === null) {
    return "—";
  }
  return new Date(timestamp).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProvenancePage() {
  const { address, isConnected } = useWallet();
  const [input, setInput] = useState("");
  const [wallet, setWallet] = useState<string | null>(null);
  const { entries, loading, error } = useProvenance(wallet);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setWallet(input.trim() === "" ? null : input.trim());
  }

  return (
    <main className="flex-1">
      <div className="mx-8 max-w-5xl py-8 sm:py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Provenance
        </h1>
        <p className="mt-2 text-sm text-base-content/70">
          Signatures and attestations recorded on-chain, in creation order.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="form-control w-full sm:max-w-md">
            <span className="label">
              <span className="label-text font-medium">Wallet address</span>
            </span>
            <input
              type="text"
              className="input input-bordered w-full font-mono text-sm"
              placeholder="0x…"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Loading…" : "Show provenance"}
            </button>
            {isConnected && address ? (
              <button
                type="button"
                className="btn btn-ghost"
                disabled={loading}
                title="Fill in the connected wallet address"
                onClick={() => {
                  setInput(address);
                  setWallet(address);
                }}
              >
                Use my wallet
              </button>
            ) : null}
          </div>
        </form>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-error">
            {error}
          </p>
        ) : null}

        {wallet && !error ? (
          <div className="mt-6">
            {loading ? (
              <p className="text-sm opacity-70">Loading on-chain history…</p>
            ) : entries.length === 0 ? (
              <div role="note" className="alert">
                <span>
                  No signatures or attestations recorded for this wallet yet.
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Type</th>
                      <th>Item ID</th>
                      <th>Content hash</th>
                      <th>IPFS</th>
                      <th>Transaction</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => (
                      <tr key={`${entry.txHash}-${entry.logIndex}`}>
                        <td className="opacity-60">{index + 1}</td>
                        <td>
                          <span
                            className={`badge badge-sm ${
                              entry.kind === "signature"
                                ? "badge-success"
                                : "badge-info"
                            }`}
                          >
                            {entry.kind}
                          </span>
                        </td>
                        <td className="font-mono text-xs" title={entry.itemId}>
                          {truncate(entry.itemId)}
                        </td>
                        <td className="font-mono text-xs">
                          {entry.contentHash ? (
                            <span title={entry.contentHash}>
                              {truncate(entry.contentHash)}
                            </span>
                          ) : (
                            <span className="opacity-40">—</span>
                          )}
                        </td>
                        <td className="font-mono text-xs">
                          {entry.ipfsCid ? (
                            <a
                              href={ipfsGatewayUrl(entry.ipfsCid)}
                              target="_blank"
                              rel="noreferrer"
                              className="link"
                              title={entry.ipfsCid}
                            >
                              {truncate(entry.ipfsCid)}
                            </a>
                          ) : (
                            <span className="opacity-40">—</span>
                          )}
                        </td>
                        <td className="font-mono text-xs" title={entry.txHash}>
                          {truncate(entry.txHash)}
                        </td>
                        <td className="whitespace-nowrap text-xs">
                          {formatTime(entry.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
