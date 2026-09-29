"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "@uiw/react-md-editor/markdown-editor.css";
import type { DbContent } from "@/lib/content-db";
import {
  auditCreateFormSchema,
  type AuditCreateFormInput,
  type AuditCreateFormValues,
} from "@/lib/form-schemas";
import { useWallet } from "@/app/hooks/use-wallet";
import {
  useAuditSign,
  type SignedAudit,
} from "@/app/hooks/use-audit-sign";
import { SignaturePanel } from "@/components/signature-panel";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type LinkedParagraph = {
  id: string;
  articleTitle: string;
  text: string;
};

export default function CreateSourcePage() {
  return (
    <Suspense>
      <CreateSourceForm />
    </Suspense>
  );
}

function CreateSourceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paragraphId = searchParams.get("paragraphId");
  const { isConnected } = useWallet();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AuditCreateFormInput, unknown, AuditCreateFormValues>({
    resolver: zodResolver(auditCreateFormSchema),
    mode: "onChange",
    defaultValues: { title: "", content: "", author: "", date: "" },
  });
  const [linked, setLinked] = useState<LinkedParagraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState<SignedAudit | null>(null);
  const [recordWarning, setRecordWarning] = useState<string | null>(null);
  const { phase: signPhase, signPayload, recordSignature } = useAuditSign();

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
    isConnected &&
    !submitting &&
    signPhase !== "signing" &&
    signed === null &&
    isValid;

  async function onValid(values: AuditCreateFormValues) {
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        title: values.title,
        content: values.content,
        ...(values.author.length > 0 ? { author: values.author } : {}),
        ...(values.date.length > 0 ? { date: values.date } : {}),
        paragraphIds: paragraphId ? [paragraphId] : [],
      };
      const signResult = await signPayload({ kind: "source", body });
      if (!signResult.ok) {
        throw new Error(`${signResult.error} Nothing was saved.`);
      }
      const response = await fetch("/api/audits/sources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        itemId?: string;
        ipfsCid?: string;
      } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed with status ${response.status}`);
      }
      if (!data?.itemId || typeof data.itemId !== "string") {
        throw new Error("Stored, but the response missed the item ID.");
      }
      if (!data?.ipfsCid || typeof data.ipfsCid !== "string") {
        throw new Error("Stored, but the response missed the IPFS CID.");
      }
      const recorded = await recordSignature({
        itemId: data.itemId,
        contentHash: signResult.signed.contentHash,
        signature: signResult.signed.signature,
        ipfsCid: data.ipfsCid,
      });
      setRecordWarning(recorded.ok ? null : recorded.error);
      setSigned(signResult.signed);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not store source");
    } finally {
      setSubmitting(false);
    }
  }

  if (signed) {
    return (
      <main className="flex-1">
        <div className="mx-8 max-w-5xl py-8 sm:py-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create new source</h1>
          <SignaturePanel
            kindLabel="Source"
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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create new source</h1>
        <p className="mt-2 text-sm text-base-content/70">
          Write the content in markdown on the left, preview it on the right.
        </p>

        {!isConnected ? (
          <div role="alert" className="alert alert-warning mt-6">
            <span>Connect your wallet to create a source.</span>
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
              No paragraph selected — this source won&apos;t be linked. Go back and click a
              reporting paragraph first to link it.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onValid)} className="mt-6 space-y-6">
          <label className="form-control w-full">
            <span className="label">
              <span className="label-text font-medium">Title</span>
            </span>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Source title"
              maxLength={200}
              disabled={!isConnected || submitting}
              {...register("title")}
            />
            {errors.title ? (
              <span className="label">
                <span role="alert" className="label-text text-error">
                  {errors.title.message}
                </span>
              </span>
            ) : null}
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
                maxLength={120}
                disabled={!isConnected || submitting}
                {...register("author")}
              />
              {errors.author ? (
                <span className="label">
                  <span role="alert" className="label-text text-error">
                    {errors.author.message}
                  </span>
                </span>
              ) : null}
            </label>
            <label className="form-control w-full">
              <span className="label">
                <span className="label-text font-medium">Date (optional)</span>
              </span>
              <input
                type="date"
                className="input input-bordered w-full"
                disabled={!isConnected || submitting}
                {...register("date")}
              />
              {errors.date ? (
                <span className="label">
                  <span role="alert" className="label-text text-error">
                    {errors.date.message}
                  </span>
                </span>
              ) : null}
            </label>
          </div>

          <div>
            <span className="label">
              <span className="label-text font-medium">Content (markdown)</span>
            </span>
            <div data-color-mode="light">
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <MDEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value ?? "")}
                    preview="live"
                    height={320}
                    visibleDragbar={false}
                  />
                )}
              />
            </div>
            {errors.content ? (
              <span className="label">
                <span role="alert" className="label-text text-error">
                  {errors.content.message}
                </span>
              </span>
            ) : null}
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
              title={!isConnected ? "Connect your wallet to create" : "Save source"}
            >
              {submitting
                ? signPhase === "signing"
                  ? "Waiting for signature…"
                  : "Saving…"
                : "Save source"}
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
