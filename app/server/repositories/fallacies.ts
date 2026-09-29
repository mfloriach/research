import { randomUUID } from "node:crypto";
import { Int32 } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { pinJson } from "@/lib/ipfs";
import { COLLECTIONS } from "@/db/migration";

export class AuditTabNotFoundError extends Error {}

export class UnknownParagraphsError extends Error {}

export class AuditItemNotFoundError extends Error {}

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
  tabId: string;
  ipfsCid: string;
};

export async function createFallacy(input: CreateFallacyInput): Promise<CreatedFallacy> {
  const db = await getDb();

  const tab = await db
    .collection<{ _id: string; label: string }>(COLLECTIONS.auditTabs)
    .findOne({ label: "Fallacies" });
  if (!tab) {
    throw new AuditTabNotFoundError(`No Fallacies audit tab available`);
  }

  if (input.paragraphIds.length > 0) {
    const matched = await db
      .collection<{ _id: string }>(COLLECTIONS.reportingParagraphs)
      .countDocuments({ _id: { $in: input.paragraphIds } });
    if (matched !== input.paragraphIds.length) {
      throw new UnknownParagraphsError("One or more related paragraphs do not exist");
    }
  }

  const itemOrder = await db
    .collection<{ _id: string }>(COLLECTIONS.auditItems)
    .countDocuments({ tabId: tab._id });
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
      tabId: string;
      title: string;
      paragraphs: string[];
      author?: string;
      date?: string;
      ipfsCid: string;
      order: Int32;
    }>(COLLECTIONS.auditItems)
    .insertOne({
      _id: itemId,
      tabId: tab._id,
      title: input.title,
      paragraphs: input.paragraphs,
      ...(input.author ? { author: input.author } : {}),
      ...(input.date ? { date: input.date } : {}),
      ipfsCid,
      order: new Int32(itemOrder),
    });

  if (input.paragraphIds.length > 0) {
    await db
      .collection<{ _id: string }>(COLLECTIONS.reportingParagraphs)
      .updateMany({ _id: { $in: input.paragraphIds } }, { $addToSet: { auditItemIds: itemId } });
  }

  return { itemId, tabId: tab._id, ipfsCid };
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
