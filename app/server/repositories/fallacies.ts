import { randomUUID } from "node:crypto";
import { Int32 } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { pinJson } from "@/lib/ipfs";
import { COLLECTIONS } from "@/db/migration";

export class UnknownParagraphsError extends Error {}

export class AuditItemNotFoundError extends Error {}

const TAB = "Fallacies";

export type CreateFallacyInput = {
  title: string;
  content: string;
  paragraphs: string[];
  author?: string;
  date?: string;
  paragraphIds: string[];
};

export type CreatedFallacy = {
  itemId: string;
  tab: string;
  ipfsCid: string;
};

export async function createFallacy(input: CreateFallacyInput): Promise<CreatedFallacy> {
  const db = await getDb();

  if (input.paragraphIds.length > 0) {
    const docs = await db
      .collection<{ paragraphs: { id: string }[] }>(COLLECTIONS.articles)
      .find(
        { "paragraphs.id": { $in: input.paragraphIds } },
        { projection: { paragraphs: 1 } },
      )
      .toArray();
    const found = new Set(docs.flatMap((doc) => doc.paragraphs.map((p) => p.id)));
    if (!input.paragraphIds.every((id) => found.has(id))) {
      throw new UnknownParagraphsError("One or more related paragraphs do not exist");
    }
  }

  const itemOrder = await db
    .collection<{ _id: string }>(COLLECTIONS.auditItems)
    .countDocuments({ tab: TAB });
  const itemId = randomUUID();

  const ipfsCid = await pinJson({
    kind: "fallacy",
    title: input.title,
    ...(input.author ? { author: input.author } : {}),
    ...(input.date ? { date: input.date } : {}),
    content: input.content,
    paragraphs: input.paragraphs,
    paragraphIds: input.paragraphIds,
  });

  await db
    .collection<{
      _id: string;
      tab: string;
      title: string;
      paragraphs: string[];
      author?: string;
      date?: string;
      ipfsCid: string;
      order: Int32;
    }>(COLLECTIONS.auditItems)
    .insertOne({
      _id: itemId,
      tab: TAB,
      title: input.title,
      paragraphs: input.paragraphs,
      ...(input.author ? { author: input.author } : {}),
      ...(input.date ? { date: input.date } : {}),
      ipfsCid,
      order: new Int32(itemOrder),
    });

  if (input.paragraphIds.length > 0) {
    await db.collection(COLLECTIONS.articles).updateMany(
      { "paragraphs.id": { $in: input.paragraphIds } },
      { $addToSet: { "paragraphs.$[p].auditItemIds": itemId } },
      { arrayFilters: [{ "p.id": { $in: input.paragraphIds } }] },
    );
  }

  return { itemId, tab: TAB, ipfsCid };
}

export async function incrementFallacyOpenCount(itemId: string): Promise<number> {
  const db = await getDb();

  const updated = await db
    .collection<{ _id: string; openCount?: number }>(COLLECTIONS.auditItems)
    .findOneAndUpdate(
      { _id: itemId },
      { $inc: { openCount: 1 } },
      { returnDocument: "after" },
    );
  if (!updated) {
    throw new AuditItemNotFoundError(`No fallacy with id ${itemId}`);
  }
  return updated.openCount ?? 1;
}
