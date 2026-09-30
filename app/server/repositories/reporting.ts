import { randomUUID } from "node:crypto";
import { Int32 } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { pinJson } from "@/lib/ipfs";
import { COLLECTIONS } from "@/db/migration";

export type CreateReportInput = {
  title: string;
  description: string;
  label?: string;
};

export type CreatedReport = {
  articleId: string;
  tab: string;
  paragraphIds: string[];
  ipfsCid: string;
};

/**
 * Store a debate report as an article with embedded paragraphs.
 * Uses the given label, or the alphabetically first existing label when
 * omitted. Throws when no label can be resolved.
 */
export async function createReport(
  input: CreateReportInput,
  chunks: string[],
): Promise<CreatedReport> {
  const db = await getDb();

  const cleanLabel = input.label?.trim() ?? "";
  let label = cleanLabel;
  if (!label) {
    const labels = await db
      .collection<{ label: string }>(COLLECTIONS.articles)
      .distinct("label");
    const sorted = (labels as string[]).sort();
    if (sorted.length === 0) {
      throw new Error("No reporting labels available");
    }
    label = sorted[0];
  }

  const articleOrder = await db
    .collection<{ _id: string }>(COLLECTIONS.articles)
    .countDocuments({ label });
  const articleId = randomUUID();

  const ipfsCid = await pinJson({
    kind: "report",
    title: input.title,
    ...(label.length > 0 ? { label } : {}),
    description: input.description,
    paragraphs: chunks,
  });

  const paragraphDocs = chunks.map((text, index) => ({
    id: randomUUID(),
    text,
    auditItemIds: [] as string[],
    order: new Int32(index),
  }));

  await db
    .collection<{
      _id: string;
      title: string;
      type: string;
      label: string;
      paragraphs: { id: string; text: string; auditItemIds: string[]; order: Int32 }[];
      ipfsCid: string;
      order: Int32;
    }>(COLLECTIONS.articles)
    .insertOne({
      _id: articleId,
      title: input.title,
      type: "text",
      label,
      paragraphs: paragraphDocs,
      ipfsCid,
      order: new Int32(articleOrder),
    });

  return {
    articleId,
    tab: label,
    paragraphIds: paragraphDocs.map((doc) => doc.id),
    ipfsCid,
  };
}
