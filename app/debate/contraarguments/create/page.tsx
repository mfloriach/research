"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "@uiw/react-md-editor/markdown-editor.css";
import {
  auditCreateFormSchema,
  type AuditCreateFormInput,
  type AuditCreateFormValues,
} from "@/lib/form-schemas";
import { useWallet } from "@/app/hooks/use-wallet";
import { useAuditSign, type SignedAudit } from "@/app/hooks/use-audit-sign";
import { SignaturePanel } from "@/components/signature-panel";
import { Field } from "@/components/form-field";
import { saveContraargument } from "@/lib/api";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

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

      const signResult = await signPayload({ kind: "contraargument", body });
      if (!signResult.ok) {
        throw new Error(`${signResult.error} Nothing was saved.`);
      }

      const data = await saveContraargument(body);

      const recorded = await recordSignature({
        itemId: data.itemId,
        contentHash: signResult.signed.contentHash,
        signature: signResult.signed.signature,
        ipfsCid: data.ipfsCid,
      });

      setRecordWarning(recorded.ok ? null : recorded.error);
      setSigned(signResult.signed);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not store contraargument",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (signed) {
    return (
      <main className="flex-1">
        <div className="mx-8 max-w-5xl py-8 sm:py-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create new contraargument
          </h1>
          <SignaturePanel
            kindLabel="Contraargument"
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

        <form onSubmit={handleSubmit(onValid)} className="mt-6 space-y-6">
          <Field label="Title" error={errors.title?.message}>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Contraargument title"
              maxLength={200}
              disabled={!isConnected || submitting}
              {...register("title")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Author (optional)" error={errors.author?.message}>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Author name"
                maxLength={120}
                disabled={!isConnected || submitting}
                {...register("author")}
              />
            </Field>
            <Field label="Date (optional)" error={errors.date?.message}>
              <input
                type="date"
                className="input input-bordered w-full"
                disabled={!isConnected || submitting}
                {...register("date")}
              />
            </Field>
          </div>

          <Field label="Content (markdown)" error={errors.content?.message}>
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
          </Field>

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
              title={
                !isConnected
                  ? "Connect your wallet to create"
                  : "Save contraargument"
              }
            >
              {submitting
                ? signPhase === "signing"
                  ? "Waiting for signature…"
                  : "Saving…"
                : "Save contraargument"}
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
