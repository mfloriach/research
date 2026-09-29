"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "@uiw/react-md-editor/markdown-editor.css";
import { useWallet } from "@/app/hooks/use-wallet";
import {
  reportCreateFormSchema,
  type ReportCreateFormInput,
  type ReportCreateFormValues,
} from "@/lib/form-schemas";
import {
  useAuditSign,
  type SignedAudit,
} from "@/app/hooks/use-audit-sign";
import { SignaturePanel } from "@/components/signature-panel";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function CreateDebatePage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ReportCreateFormInput, unknown, ReportCreateFormValues>({
    resolver: zodResolver(reportCreateFormSchema),
    mode: "onChange",
    defaultValues: { title: "", label: "", description: "" },
  });
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
    isValid;

  async function onValid(values: ReportCreateFormValues) {
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        title: values.title,
        label: values.label,
        description: values.description,
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
        ipfsCid?: string;
      } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed with status ${response.status}`);
      }
      if (!data?.articleId || typeof data.articleId !== "string") {
        throw new Error("Stored, but the response missed the article ID.");
      }
      if (!data?.ipfsCid || typeof data.ipfsCid !== "string") {
        throw new Error("Stored, but the response missed the IPFS CID.");
      }
      const recorded = await recordSignature({
        itemId: data.articleId,
        contentHash: signResult.signed.contentHash,
        signature: signResult.signed.signature,
        ipfsCid: data.ipfsCid,
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

        <form onSubmit={handleSubmit(onValid)} className="mt-6 space-y-6">
          <label className="form-control w-full">
            <span className="label">
              <span className="label-text font-medium">Title</span>
            </span>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Report title"
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

          <label className="form-control w-full">
            <span className="label">
              <span className="label-text font-medium">Label</span>
            </span>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Section label (e.g. Clima)"
              maxLength={60}
              disabled={!isConnected || submitting}
              {...register("label")}
            />
            {errors.label ? (
              <span className="label">
                <span role="alert" className="label-text text-error">
                  {errors.label.message}
                </span>
              </span>
            ) : null}
          </label>

          <div>
            <span className="label">
              <span className="label-text font-medium">Description (markdown)</span>
            </span>
            <div data-color-mode="light">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <MDEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value ?? "")}
                    preview="live"
                    height={400}
                    visibleDragbar={false}
                  />
                )}
              />
            </div>
            {errors.description ? (
              <span className="label">
                <span role="alert" className="label-text text-error">
                  {errors.description.message}
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
