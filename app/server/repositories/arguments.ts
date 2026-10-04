import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/db/migration";
import type { HotTopicsSort } from "@/lib/api-schemas";

export type ListedArgument = {
  id: string;
  title: string;
  description: string;
  labels: string[];
  /** ISO timestamp; epoch fallback for documents predating `createdAt`. */
  createdAt: string;
};

type ArgumentDoc = {
  _id: string;
  title: string;
  description: string;
  labels?: string[];
  createdAt?: Date;
};

/**
 * List arguments for the hot-topics page.
 * Labels combine with OR (dossier-style); sorting is by `createdAt`.
 * All database queries for arguments live here (never in `app/api`).
 */
export async function listArguments(input: {
  labels: string[];
  sort: HotTopicsSort;
}): Promise<ListedArgument[]> {
  const db = await getDb();
  const docs = await db
    .collection<ArgumentDoc>(COLLECTIONS.arguments)
    .find(input.labels.length > 0 ? { labels: { $in: input.labels } } : {})
    .sort({ createdAt: input.sort === "oldest" ? 1 : -1 })
    .toArray();
  return docs.map((doc) => ({
    id: doc._id,
    title: doc.title,
    description: doc.description,
    labels: [...new Set(doc.labels ?? [])],
    createdAt: (doc.createdAt ?? new Date(0)).toISOString(),
  }));
}
