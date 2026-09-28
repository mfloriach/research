import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import { randomUUID } from "node:crypto";
import { Int32 } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/db/migration";

type AuditItemBody = {
  title?: unknown;
  content?: unknown;
  author?: unknown;
  date?: unknown;
  paragraphIds?: unknown;
};

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

export const POST = withRouteLogging(`api/audits/evidences`, async (request, log) => {
    let body: AuditItemBody;
    try {
      body = (await request.json()) as AuditItemBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const cleanTitle = typeof body.title === "string" ? body.title.trim() : "";
    const cleanContent = typeof body.content === "string" ? body.content.trim() : "";
    const cleanAuthor = typeof body.author === "string" ? body.author.trim() : "";
    const cleanDate = typeof body.date === "string" ? body.date.trim() : "";
    const paragraphIds = Array.isArray(body.paragraphIds)
      ? body.paragraphIds.filter((id): id is string => typeof id === "string" && id.length > 0)
      : [];

    if (cleanTitle.length < 3 || cleanTitle.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title must be between 3 and ${MAX_TITLE_LENGTH} characters` },
        { status: 400 },
      );
    }
    if (cleanAuthor.length > MAX_AUTHOR_LENGTH) {
      return NextResponse.json(
        { error: `Author must be at most ${MAX_AUTHOR_LENGTH} characters` },
        { status: 400 },
      );
    }
    if (cleanDate.length > 0 && !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return NextResponse.json({ error: "Date must use YYYY-MM-DD format" }, { status: 400 });
    }
    if (cleanContent.length === 0 || cleanContent.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content must be between 1 and ${MAX_CONTENT_LENGTH} characters` },
        { status: 400 },
      );
    }

    const paragraphs = splitAuditParagraphs(cleanContent);
    if (paragraphs.length === 0) {
      return NextResponse.json({ error: "Content must not be empty" }, { status: 400 });
    }

    try {
      const db = await getDb();

      const tab = await db
        .collection<AuditTabDoc>(COLLECTIONS.auditTabs)
        .findOne({ label: "Evidences" });
      if (!tab) {
        return NextResponse.json(
          { error: `No "Evidences" audit tab available` },
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
          kind: "evidences",
          itemId,
          tabId: tab._id,
          linkedParagraphs: paragraphIds.length,
        },
        `Stored new evidences audit item`,
      );

      return NextResponse.json({ itemId, tabId: tab._id }, { status: 201 });
    } catch (error) {
      log.error(
        { event: "audit.failed", kind: "evidences", err: error },
        `Failed to store new evidences`,
      );
      return NextResponse.json({ error: "Could not store audit item" }, { status: 500 });
    }
  })