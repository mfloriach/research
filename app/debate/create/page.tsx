"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import { useWallet } from "@/app/hooks/use-wallet";
import {
  useAuditSign,
  type SignedAudit,
} from "@/app/hooks/use-audit-sign";
import { SignaturePanel } from "@/components/signature-panel";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function CreateDebatePage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState<SignedAudit | null>(null);
  const [recordWarning, setRecordWarning] = useState<string | null>(null);
  const { phase: signPhase, signPayload, recordSignature } = useAuditSign();

  const canSubmit =
    isConnected &&
    !submitting &&
    signPhase !== "signing" &&
    signed === null &&
    title.trim().length >= 3 &&
    description.trim().length > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        title: title.trim(),
        label: label.trim(),
        description: description.trim(),
      };
      const signResult = await signPayload({ kind: "report", body });
      if (!signResult.ok) {
        throw new Error(`${signResult.error} Nothing was saved.`);
      }
      const response = await fetch("/api/debates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        articleId?: string;
      } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed with status ${response.status}`);
      }
      if (!data?.articleId || typeof data.articleId !== "string") {
        throw new Error("Stored, but the response missed the article ID.");
      }
      const recorded = await recordSignature({
        itemId: data.articleId,
        contentHash: signResult.signed.contentHash,
        signature: signResult.signed.signature,
      });
      setRecordWarning(recorded.ok ? null : recorded.error);
      setSigned(signResult.signed);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not store report");
    } finally {
      setSubmitting(false);
    }
  }

  if (signed) {
    return (
      <main className="flex-1">
        <div className="mx-8 max-w-5xl py-8 sm:py-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create new report</h1>
          <SignaturePanel
            kindLabel="Report"
            signer={signed.signer}
            signature={signed.signature}
            contentHash={signed.contentHash}
            recordWarning={recordWarning}
            onContinue={() => router.push("/")}
          />
        </div>
      </main>
    );
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
              {submitting
                ? signPhase === "signing"
                  ? "Waiting for signature…"
                  : "Saving…"
                : "Save report"}
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
