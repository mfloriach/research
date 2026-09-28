import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import { randomUUID } from "node:crypto";
import { Int32 } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/db/migration";
import { z } from "zod";

type AuditTabDoc = { _id: string; label: string; order?: number };

const MAX_TITLE_LENGTH = 200;
const MAX_AUTHOR_LENGTH = 120;
const MAX_CONTENT_LENGTH = 20000;

export function splitAuditParagraphs(markdown: string): string[] {
  return markdown
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

const auditItemSchema = z.object({
  title: z
    .string({ error: "Title must be a string" })
    .trim()
    .min(3, { error: `Title must be between 3 and ${MAX_TITLE_LENGTH} characters` })
    .max(MAX_TITLE_LENGTH, {
      error: `Title must be between 3 and ${MAX_TITLE_LENGTH} characters`,
    }),
  content: z
    .string({ error: "Content must be a string" })
    .trim()
    .min(1, { error: "Content must not be empty" })
    .max(MAX_CONTENT_LENGTH, {
      error: `Content must be between 1 and ${MAX_CONTENT_LENGTH} characters`,
    })
    .refine((value) => splitAuditParagraphs(value).length > 0, {
      error: "Content must not be empty",
    }),
  author: z
    .string({ error: "Author must be a string" })
    .trim()
    .max(MAX_AUTHOR_LENGTH, { error: `Author must be at most ${MAX_AUTHOR_LENGTH} characters` })
    .optional(),
  date: z
    .string({ error: "Date must be a string" })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must use YYYY-MM-DD format" })
    .optional(),
  paragraphIds: z.array(z.string().min(1)).optional().default([]),
});

export const POST =  withRouteLogging(`api/audits/sources`, async (request, log) => {
    let raw: Record<string, unknown>;
    try {
      raw = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = auditItemSchema.safeParse({
      ...raw,
      author: raw.author === "" ? undefined : raw.author,
      date: raw.date === "" ? undefined : raw.date,
      paragraphIds: Array.isArray(raw.paragraphIds)
        ? raw.paragraphIds.filter((id): id is string => typeof id === "string" && id.length > 0)
        : [],
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
        { status: 400 },
      );
    }

    const cleanTitle = parsed.data.title;
    const cleanContent = parsed.data.content;
    const cleanAuthor = parsed.data.author ?? "";
    const cleanDate = parsed.data.date ?? "";
    const paragraphIds = parsed.data.paragraphIds;

    const paragraphs = splitAuditParagraphs(cleanContent);

    try {
      const db = await getDb();

      const tab = await db
        .collection<AuditTabDoc>(COLLECTIONS.auditTabs)
        .findOne({ label: "Sources" });
      if (!tab) {
        return NextResponse.json(
          { error: `No "Sources" audit tab available` },
          { status: 500 },
        );
      }

      if (paragraphIds.length > 0) {
        const matched = await db
          .collection<{ _id: string }>(COLLECTIONS.reportingParagraphs)
          .countDocuments({ _id: { $in: paragraphIds } });
        if (matched !== paragraphIds.length) {
          return NextResponse.json(
            { error: "One or more related paragraphs do not exist" },
            { status: 400 },
          );
        }
      }

      const itemOrder = await db
        .collection<{ _id: string }>(COLLECTIONS.auditItems)
        .countDocuments({ tabId: tab._id });
      const itemId = randomUUID();

      await db
        .collection<{
          _id: string;
          tabId: string;
          title: string;
          paragraphs: string[];
          author?: string;
          date?: string;
          order: Int32;
        }>(COLLECTIONS.auditItems)
        .insertOne({
          _id: itemId,
          tabId: tab._id,
          title: cleanTitle,
          paragraphs,
          ...(cleanAuthor.length > 0 ? { author: cleanAuthor } : {}),
          ...(cleanDate.length > 0 ? { date: cleanDate } : {}),
          order: new Int32(itemOrder),
        });

      if (paragraphIds.length > 0) {
        await db
          .collection<{ _id: string }>(COLLECTIONS.reportingParagraphs)
          .updateMany({ _id: { $in: paragraphIds } }, { $addToSet: { auditItemIds: itemId } });
      }

      log.info(
        {
          event: "audit.created",
          kind: "sources",
          itemId,
          tabId: tab._id,
          linkedParagraphs: paragraphIds.length,
        },
        `Stored new sources audit item`,
      );

      return NextResponse.json({ itemId, tabId: tab._id }, { status: 201 });
    } catch (error) {
      log.error(
        { event: "audit.failed", kind: "sources", err: error },
        `Failed to store new sources`,
      );
      return NextResponse.json({ error: "Could not store audit item" }, { status: 500 });
    }
  });