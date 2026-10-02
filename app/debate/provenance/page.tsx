"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@/app/hooks/use-wallet";
import { useProvenance } from "@/app/hooks/use-provenance";
import { useContentIndex } from "@/app/hooks/use-content-index";
import { CopyButton } from "@/components/copy-button";
import {
  ProvenanceSummary,
  kindBadgeClass,
} from "@/components/provenance-summary";
import { ipfsGatewayUrl } from "@/lib/ipfs-gateway";
import { truncateText } from "@/lib/provenance-view";

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
  return (
    <Suspense>
      <ProvenanceContent />
    </Suspense>
  );
}

function ProvenanceContent() {
  // Deep link from an article byline: /debate/provenance?address=0x…
  const searchParams = useSearchParams();
  const requested = searchParams.get("address") ?? "";
  const { address: connectedAddress, isConnected } = useWallet();

  // Without a search form, the wallet comes from the query string, falling
  // back to the connected wallet.
  const wallet =
    requested !== ""
      ? requested
      : isConnected && connectedAddress
        ? connectedAddress
        : null;

  const { entries, loading, error } = useProvenance(wallet);
  const { articles, loading: contentLoading, resolve } = useContentIndex();
  const provenancedIds = new Set(entries.map((entry) => entry.itemId));

  const walletAuthor = articles.find(
    (article) =>
      article.authorAddress !== undefined &&
      wallet !== null &&
      article.authorAddress.toLowerCase() === wallet.toLowerCase(),
  );
  const walletName = walletAuthor?.author;

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
        <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Provenance
        </h1>
        <p className="mt-2 text-center text-sm text-base-content/70">
          Signatures and attestations recorded on-chain, in creation order.
        </p>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm">
          <span className="text-base-content/70">Wallet</span>
          {wallet ? (
            <>
              <span className="font-semibold">
                {walletName ?? truncate(wallet)}
              </span>
              {walletName ? (
                <span
                  className="font-mono text-xs text-base-content/60"
                  title={wallet}
                >
                  {truncate(wallet)}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-base-content/60">
              Connect a wallet, or open an author byline to inspect one.
            </span>
          )}
        </p>

        {contentLoading ? (
          <p className="mt-8 text-center text-sm opacity-70">
            Loading dossier content…
          </p>
        ) : (
          <>
            <ProvenanceSummary articles={articles} />

            <section aria-label="Articles and audit items" className="mt-8">
              <h2 className="text-center text-xl font-semibold">Articles</h2>
              <div className="mt-4 flex flex-col gap-4">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="card bg-base-200 shadow-sm"
                  >
                    <div className="card-body gap-3 p-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="font-semibold leading-snug">
                          {article.title}
                        </h3>
                        <CopyButton value={article.id} label="article ID" />
                      </div>
                      {article.labels.length > 0 ? (
                        <ul
                          aria-label="Article labels"
                          className="flex flex-wrap justify-center gap-1.5"
                        >
                          {article.labels.map((label) => (
                            <li key={label}>
                              <span className="badge badge-outline badge-sm">
                                {label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {article.rows.length === 0 ? (
                        <p className="text-xs opacity-60">
                          No linked audit items.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="table table-sm text-center">
                            <thead>
                              <tr>
                                <th className="text-center">Type</th>
                                <th className="text-center">Audit paragraph</th>
                                <th className="text-center">Date</th>
                                <th>
                                  <span className="sr-only">Copy ID</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {article.rows.map((row) => (
                                <tr key={row.id}>
                                  <td>
                                    <span className="flex items-center justify-center gap-1.5">
                                      <span
                                        className={`badge badge-sm ${kindBadgeClass(row.tab)}`}
                                      >
                                        {row.tab}
                                      </span>
                                      {provenancedIds.has(row.id) ? (
                                        <span className="badge badge-outline badge-xs">
                                          on-chain
                                        </span>
                                      ) : null}
                                    </span>
                                  </td>
                                  <td className="text-xs" title={row.excerpt}>
                                    {truncateText(row.excerpt)}
                                  </td>
                                  <td className="whitespace-nowrap text-xs">
                                    {row.date ?? (
                                      <span className="opacity-40">—</span>
                                    )}
                                  </td>
                                  <td>
                                    <CopyButton
                                      value={row.id}
                                      label={`${row.tab} item ID`}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

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
                      <th>Item</th>
                      <th>Content hash</th>
                      <th>IPFS</th>
                      <th>Transaction</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => {
                      const resolved = resolve(entry.itemId);
                      return (
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
                          <td className="text-xs">
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`badge badge-sm ${kindBadgeClass(resolved.kind)}`}
                              >
                                {resolved.kind}
                              </span>
                              <span
                                className="max-w-48 truncate font-medium"
                                title={resolved.name}
                              >
                                {resolved.isArticle ||
                                resolved.kind !== "Unknown"
                                  ? resolved.name
                                  : truncate(resolved.name)}
                              </span>
                              <CopyButton
                                value={entry.itemId}
                                label="item ID"
                              />
                            </span>
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
                      );
                    })}
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
