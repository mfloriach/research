"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import { useWallet } from "@/app/hooks/use-wallet";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function CreateDebatePage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    isConnected && !submitting && title.trim().length >= 3 && description.trim().length > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/debates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          label: label.trim(),
          description: description.trim(),
        }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed with status ${response.status}`);
      }
      router.push("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not store report");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1">
      <div className="mx-8 max-w-5xl py-8 sm:py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create new report</h1>
        <p className="mt-2 text-sm text-base-content/70">
          Write the description in markdown on the left, preview it on the right.
        </p>

        {!isConnected ? (
          <div role="alert" className="alert alert-warning mt-6">
            <span>Connect your wallet to create a report.</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <label className="form-control w-full">
            <span className="label">
              <span className="label-text font-medium">Title</span>
            </span>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Report title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={3}
              maxLength={200}
              required
              disabled={!isConnected || submitting}
            />
          </label>

          <label className="form-control w-full">
            <span className="label">
              <span className="label-text font-medium">Label</span>
            </span>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Section label (e.g. Clima)"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={60}
              disabled={!isConnected || submitting}
            />
          </label>

          <div>
            <span className="label">
              <span className="label-text font-medium">Description (markdown)</span>
            </span>
            <div data-color-mode="light">
              <MDEditor
                value={description}
                onChange={(value) => setDescription(value ?? "")}
                preview="live"
                height={400}
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
              title={!isConnected ? "Connect your wallet to create a report" : "Save report"}
            >
              {submitting ? "Saving…" : "Save report"}
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
