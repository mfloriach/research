"use client";

import { useEffect, useState } from "react";

export type SearchProps = {
  search: {
    placeholder: string;
    label: string;
  };
  query: string;
  setQuery: (query: string) => void;
  /** Called with the current query when the form is submitted (Enter). */
  onSubmitSearch?: (query: string) => void;
};

export function Search({ search, query, setQuery, onSubmitSearch }: SearchProps) {
  const [open, setOpen] = useState(false);

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
  }, [open]);

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
            className="card w-full max-w-md bg-base-100 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="card-body">
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (query.trim() === "") {
                    return;
                  }
                  await onSubmitSearch?.(query);
                  setOpen(false);
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
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
