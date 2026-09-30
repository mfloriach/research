import { randomUUID } from "node:crypto";
import { Int32 } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { pinJson } from "@/lib/ipfs";
import { COLLECTIONS } from "@/db/migration";
import {NotFoundError} from "@/lib/errors"


const TAB = "Evidences";

export type CreateEvidenceInput = {
  title: string;
  content: string;
  paragraphs: string[];
  author?: string;
  date?: string;
  paragraphIds: string[];
};

export type CreatedEvidence = {
  itemId: string;
  tab: string;
  ipfsCid: string;
};

export async function createEvidence(input: CreateEvidenceInput): Promise<CreatedEvidence> {
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
      throw new NotFoundError("One or more related paragraphs do not exist");
    }
  }

  const itemOrder = await db
    .collection<{ _id: string }>(COLLECTIONS.replies)
    .countDocuments({ tab: TAB });
  const itemId = randomUUID();

  const ipfsCid = await pinJson({
    kind: "evidence",
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

  if (input.paragraphIds.length > 0) {
    await db.collection(COLLECTIONS.articles).updateMany(
      { "paragraphs.id": { $in: input.paragraphIds } },
      { $addToSet: { "paragraphs.$[p].auditItemIds": itemId } },
      { arrayFilters: [{ "p.id": { $in: input.paragraphIds } }] },
    );
  }

  return { itemId, tab: TAB, ipfsCid };
}

export async function incrementEvidenceOpenCount(itemId: string): Promise<number> {
  const db = await getDb();

  const updated = await db
    .collection<{ _id: string; openCount?: number }>(COLLECTIONS.replies)
    .findOneAndUpdate(
      { _id: itemId },
      { $inc: { openCount: 1 } },
      { returnDocument: "after" },
    );
  if (!updated) {
    throw new NotFoundError(`No evidence with id ${itemId}`);
  }
  return updated.openCount ?? 1;
}
