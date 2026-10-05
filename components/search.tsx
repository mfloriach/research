"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EyeIcon, ShieldCheckIcon } from "./icons";

export type SearchMatchView = {
  articleId: string;
  argumentId: string;
  title: string;
  score: number;
  openCount: number;
  /** On-chain attestation count, or null while unloaded/unavailable. */
  attestationCount: number | null;
};

export type SearchResults = {
  matches: SearchMatchView[];
  answer: string;
  model: string;
} | null;

export type SearchProps = {
  search: {
    placeholder: string;
    label: string;
  };
  query: string;
  setQuery: (query: string) => void;
  /** Called with the current query when the form is submitted (Enter). */
  onSubmitSearch?: (query: string) => void | Promise<void>;
  status: "idle" | "loading" | "done" | "error";
  results: SearchResults;
  error: string | null;
};

export function Search({
  search,
  query,
  setQuery,
  onSubmitSearch,
  status,
  results,
  error,
}: SearchProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open ]);

  return (
    <>
      <label className="input">
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          type="search"
          required
          placeholder="Search"
          onClick={() => setOpen(true)}
        />
      </label>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={search.label}
            className="card max-h-[80vh] w-full max-w-md overflow-y-auto bg-base-100 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="card-body gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-lg font-semibold">
                  {search.label}
                </h2>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setOpen(false)}
                  aria-label="Close search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (query.trim() === "" || submitting) {
                    return;
                  }
                  setSubmitting(true);
                  try {
                    await onSubmitSearch?.(query);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <label className="input w-full">
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
                    ref={(element) => {
                      element?.focus();
                    }}
                  />
                </label>
              </form>

              {status === "loading" || submitting ? (
                <p className="text-sm opacity-70" role="status">
                  Searching the dossier…
                </p>
              ) : null}

              {status === "error" && error ? (
                <p role="alert" className="text-sm text-error">
                  {error}
                </p>
              ) : null}

              {status === "done" && results ? (
                <div className="space-y-4">
                  {results.answer ? (
                    <div className="rounded-lg bg-base-200 p-3">
                      <p className="text-sm leading-6">{results.answer}</p>
                      <p className="mt-1 font-mono text-xs opacity-60">
                        {results.model}
                      </p>
                    </div>
                  ) : null}
                  {results.matches.length > 0 ? (
                    <ul className="divide-y divide-base-300">
                      {results.matches.map((match) => (
                        <li key={match.articleId}>
                          <Link
                            href={`/debate/argument/${match.argumentId}#${match.articleId}`}
                            className="flex items-center justify-between gap-3 py-2 text-left text-sm transition-colors hover:text-primary"
                            onClick={() => setOpen(false)}
                            title={match.title}
                          >
                            <span className="truncate font-medium">
                              {match.title}
                            </span>
                            <span className="flex shrink-0 items-center gap-3 font-mono text-xs tabular-nums opacity-70">
                              <span
                                className="flex items-center gap-1"
                                title={`${match.openCount} ${match.openCount === 1 ? "open" : "opens"}`}
                              >
                                <EyeIcon />
                                <span aria-label={`${match.openCount} opens`}>
                                  {match.openCount}
                                </span>
                              </span>
                              {typeof match.attestationCount === "number" ? (
                                <span
                                  className="flex items-center gap-1"
                                  title={`${match.attestationCount} attestations`}
                                >
                                  <ShieldCheckIcon />
                                  <span
                                    aria-label={`${match.attestationCount} attestations`}
                                  >
                                    {match.attestationCount}
                                  </span>
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm opacity-70">
                      No matches in the dossier. Try different words.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
