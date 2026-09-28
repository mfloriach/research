"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import type { DbContent } from "@/lib/content-db";
import { useWallet } from "@/app/hooks/use-wallet";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type LinkedParagraph = {
  id: string;
  articleTitle: string;
  text: string;
};

export default function CreateContraargumentPage() {
  return (
    <Suspense>
      <CreateContraargumentForm />
    </Suspense>
  );
}

function CreateContraargumentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paragraphId = searchParams.get("paragraphId");
  const { isConnected } = useWallet();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [linked, setLinked] = useState<LinkedParagraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!paragraphId) {
      return;
    }
    let cancelled = false;
    fetch("/api/content")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json() as Promise<DbContent>;
      })
      .then((data) => {
        if (cancelled) {
          return;
        }
        for (const tab of data.reportingCard.tabs) {
          for (const article of tab.items) {
            const paragraph = article.paragraphs.find((entry) => entry.id === paragraphId);
            if (paragraph) {
              setLinked({ id: paragraph.id, articleTitle: article.title, text: paragraph.text });
              return;
            }
          }
        }
        setLinked(null);
      })
      .catch(() => {
        if (!cancelled) {
          setLinked(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [paragraphId]);

  const canSubmit =
    isConnected && !submitting && title.trim().length >= 3 && content.trim().length > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/audits/contraarguments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          ...(author.trim().length > 0 ? { author: author.trim() } : {}),
          ...(date.length > 0 ? { date } : {}),
          paragraphIds: paragraphId ? [paragraphId] : [],
        }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed with status ${response.status}`);
      }
      router.push("/");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Could not store contraargument",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1">
      <div className="mx-8 max-w-5xl py-8 sm:py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Create new contraargument
        </h1>
        <p className="mt-2 text-sm text-base-content/70">
          Write the content in markdown on the left, preview it on the right.
        </p>

        {!isConnected ? (
          <div role="alert" className="alert alert-warning mt-6">
            <span>Connect your wallet to create a contraargument.</span>
          </div>
        ) : null}

        {linked ? (
          <div className="mt-6 rounded-box border border-base-300 bg-base-200/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
              Linked paragraph · {linked.articleTitle}
            </p>
            <p className="mt-1 line-clamp-3 text-sm opacity-80">{linked.text}</p>
          </div>
        ) : (
          <div role="note" className="alert mt-6">
            <span>
              No paragraph selected — this contraargument won&apos;t be linked. Go back and click
              a reporting paragraph first to link it.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <label className="form-control w-full">
            <span className="label">
              <span className="label-text font-medium">Title</span>
            </span>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Contraargument title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={3}
              maxLength={200}
              required
              disabled={!isConnected || submitting}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-control w-full">
              <span className="label">
                <span className="label-text font-medium">Author (optional)</span>
              </span>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Author name"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                maxLength={120}
                disabled={!isConnected || submitting}
              />
            </label>
            <label className="form-control w-full">
              <span className="label">
                <span className="label-text font-medium">Date (optional)</span>
              </span>
              <input
                type="date"
                className="input input-bordered w-full"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={!isConnected || submitting}
              />
            </label>
          </div>

          <div>
            <span className="label">
              <span className="label-text font-medium">Content (markdown)</span>
            </span>
            <div data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(value) => setContent(value ?? "")}
                preview="live"
                height={320}
                visibleDragbar={false}
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit}
              title={!isConnected ? "Connect your wallet to create" : "Save contraargument"}
            >
              {submitting ? "Saving…" : "Save contraargument"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push("/")}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
