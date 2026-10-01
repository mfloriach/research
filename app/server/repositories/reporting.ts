import { randomUUID } from "node:crypto";
import { Int32 } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { pinJson } from "@/lib/ipfs";
import { articleEmbeddingText, embedText } from "@/lib/embeddings";
import { COLLECTIONS } from "@/db/migration";

export type CreateReportInput = {
  title: string;
  description: string;
  labels?: string[];
};

export type CreatedReport = {
  articleId: string;
  tabs: string[];
  paragraphIds: string[];
  ipfsCid: string;
};

/**
 * Store a debate report as an article with embedded paragraphs.
 * Uses the given labels, or the alphabetically first existing label when
 * omitted. The article appears under every matching reporting tab.
 * Articles always reference the singleton argument.
 * Throws when no label or argument can be resolved.
 */
export async function createReport(
  input: CreateReportInput,
  chunks: string[],
): Promise<CreatedReport> {
  const db = await getDb();

  const [argument] = await db
    .collection<{ _id: string }>(COLLECTIONS.arguments)
    .find({})
    .limit(1)
    .toArray();
  if (!argument) {
    throw new Error("No argument available");
  }

  const labels = [...new Set((input.labels ?? []).map((label) => label.trim()))].filter(
    (label) => label.length > 0,
  );
  if (labels.length === 0) {
    const existing = await db
      .collection(COLLECTIONS.articles)
      .distinct("labels");
    const sorted = (existing as string[]).sort();
    if (sorted.length === 0) {
      throw new Error("No reporting labels available");
    }
    labels.push(sorted[0] as string);
  }

  const articleOrder = await db
    .collection<{ _id: string }>(COLLECTIONS.articles)
    .countDocuments({ labels: labels[0] });
  const articleId = randomUUID();

  const ipfsCid = await pinJson({
    kind: "report",
    title: input.title,
    labels,
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
      labels: string[];
      argumentId: string;
      paragraphs: { id: string; text: string; auditItemIds: string[]; order: Int32 }[];
      ipfsCid: string;
      order: Int32;
    }>(COLLECTIONS.articles)
    .insertOne({
      _id: articleId,
      title: input.title,
      type: "text",
      labels,
      argumentId: argument._id,
      paragraphs: paragraphDocs,
      ipfsCid,
      order: new Int32(articleOrder),
    });

  const embedding = await embedText(
    articleEmbeddingText(
      input.title,
      chunks,
    ),
  );
  await db
    .collection<{ _id: string; articleId: string; embedding: number[] }>(
      COLLECTIONS.articleEmbeddings,
    )
    .insertOne({
      _id: `emb-${articleId}`,
      articleId,
      embedding,
    });

  return {
    articleId,
    tabs: labels,
    paragraphIds: paragraphDocs.map((doc) => doc.id),
    ipfsCid,
  };
}
