import { randomUUID } from "node:crypto";
import { Int32 } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { pinJson } from "@/lib/ipfs";
import { COLLECTIONS } from "@/db/migration";
import { NotFoundError } from "@/lib/errors";

const TAB = "Sources";

export type CreateSourceInput = {
  title: string;
  content: string;
  paragraphs: string[];
  author: string;
  date: string;
  paragraphIds: string[];
};

export type CreatedSource = {
  itemId: string;
  ipfsCid: string;
};

export async function createSource(
  input: CreateSourceInput,
): Promise<CreatedSource> {
  const db = await getDb();

  const itemOrder = await db
    .collection<{ _id: string }>(COLLECTIONS.replies)
    .countDocuments({ tab: TAB });

  const itemId = randomUUID();

  const ipfsCid = await pinJson({
    kind: "source",
    title: input.title,
    ...(input.author ? { author: input.author } : {}),
    ...(input.date ? { date: input.date } : {}),
    content: input.content,
    paragraphs: input.paragraphs,
    paragraphIds: input.paragraphIds,
  });

  await db.client.startSession().withTransaction(async () => {
    await db
      .collection<{
        _id: string;
        tab: string;
        title: string;
        type: string;
        paragraphs: string[];
        author?: string;
        date?: string;
        ipfsCid: string;
        order: Int32;
      }>(COLLECTIONS.replies)
      .insertOne({
        _id: itemId,
        tab: TAB,
        title: input.title,
        type: "text",
        paragraphs: input.paragraphs,
        ...(input.author ? { author: input.author } : {}),
        ...(input.date ? { date: input.date } : {}),
        ipfsCid,
        order: new Int32(itemOrder),
      });

    await db
      .collection(COLLECTIONS.articles)
      .updateMany(
        { "paragraphs.id": { $in: input.paragraphIds } },
        { $addToSet: { "paragraphs.$[p].auditItemIds": itemId } },
        { arrayFilters: [{ "p.id": { $in: input.paragraphIds } }] },
      );
  });

  return { itemId, ipfsCid };
}

export async function incrementSourceOpenCount(
  sourceId: string,
): Promise<number> {
  const db = await getDb();

  const updated = await db
    .collection<{ _id: string; openCount?: number }>(COLLECTIONS.replies)
    .findOneAndUpdate(
      { _id: sourceId },
      { $inc: { openCount: 1 } },
      { returnDocument: "after" },
    );

  if (!updated) {
    throw new NotFoundError(`No source with id ${sourceId}`);
  }

  return updated.openCount ?? 1;
}
