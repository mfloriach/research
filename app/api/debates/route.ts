import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Int32 } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { withRouteLogging } from "@/lib/api-log";
import { COLLECTIONS } from "@/db/migration";

const MAX_TITLE_LENGTH = 200;
const MAX_LABEL_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 20000;

type ReportingTabDoc = { _id: string; label: string; order?: number };

function splitMarkdownParagraphs(markdown: string): string[] {
  return markdown
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

export const POST = withRouteLogging("api/debates", async (request, log) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, label, description, tabId } = (body ?? {}) as {
    title?: unknown;
    label?: unknown;
    description?: unknown;
    tabId?: unknown;
  };

  const cleanTitle = typeof title === "string" ? title.trim() : "";
  const cleanLabel = typeof label === "string" ? label.trim() : "";
  const cleanDescription = typeof description === "string" ? description.trim() : "";

  if (cleanTitle.length < 3 || cleanTitle.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `Title must be between 3 and ${MAX_TITLE_LENGTH} characters` },
      { status: 400 },
    );
  }
  if (cleanLabel.length > MAX_LABEL_LENGTH) {
    return NextResponse.json(
      { error: `Label must be at most ${MAX_LABEL_LENGTH} characters` },
      { status: 400 },
    );
  }
  if (cleanDescription.length === 0 || cleanDescription.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      { error: `Description must be between 1 and ${MAX_DESCRIPTION_LENGTH} characters` },
      { status: 400 },
    );
  }

  const chunks = splitMarkdownParagraphs(cleanDescription);
  if (chunks.length === 0) {
    return NextResponse.json({ error: "Description must not be empty" }, { status: 400 });
  }

  try {
    const db = await getDb();

    let targetTabId = typeof tabId === "string" && tabId.length > 0 ? tabId : null;
    if (targetTabId) {
      const tab = await db
        .collection<ReportingTabDoc>(COLLECTIONS.reportingTabs)
        .findOne({ _id: targetTabId }, { projection: { _id: 1 } });
      if (!tab) {
        return NextResponse.json({ error: "Unknown reporting tab" }, { status: 400 });
      }
    } else if (cleanLabel.length > 0) {
      const existing = await db
        .collection<ReportingTabDoc>(COLLECTIONS.reportingTabs)
        .findOne({ label: cleanLabel });
      if (existing) {
        targetTabId = existing._id;
      } else {
        const lastTab = await db
          .collection<ReportingTabDoc>(COLLECTIONS.reportingTabs)
          .find({})
          .sort({ order: -1 })
          .limit(1)
          .toArray();
        const nextOrder = (lastTab[0]?.order ?? -1) + 1;
        targetTabId = randomUUID();
        await db
          .collection<{ _id: string; label: string; order: Int32 }>(
            COLLECTIONS.reportingTabs,
          )
          .insertOne({ _id: targetTabId, label: cleanLabel, order: new Int32(nextOrder) });
        log.info(
          { event: "debate.tabCreated", tabId: targetTabId, label: cleanLabel },
          `Created new reporting tab "${cleanLabel}"`,
        );
      }
    } else {
      const firstTab = await db
        .collection<ReportingTabDoc>(COLLECTIONS.reportingTabs)
        .find({})
        .sort({ order: 1 })
        .limit(1)
        .toArray();
      if (firstTab.length === 0) {
        return NextResponse.json({ error: "No reporting tabs available" }, { status: 500 });
      }
      targetTabId = firstTab[0]._id;
    }

    const articleOrder = await db
      .collection<{ _id: string }>(COLLECTIONS.reportingArticles)
      .countDocuments({ tabId: targetTabId });
    const articleId = randomUUID();

    await db
      .collection<{
        _id: string;
        tabId: string;
        title: string;
        order: Int32;
      }>(COLLECTIONS.reportingArticles)
      .insertOne({
        _id: articleId,
        tabId: targetTabId,
        title: cleanTitle,
        order: new Int32(articleOrder),
      });

    const paragraphDocs = chunks.map((text, index) => ({
      _id: randomUUID(),
      articleId,
      text,
      auditItemIds: [] as string[],
      order: new Int32(index),
    }));
    if (paragraphDocs.length > 0) {
      await db
        .collection<{
          _id: string;
          articleId: string;
          text: string;
          auditItemIds: string[];
          order: Int32;
        }>(COLLECTIONS.reportingParagraphs)
        .insertMany(paragraphDocs);
    }

    log.info(
      {
        event: "debate.created",
        articleId,
        tabId: targetTabId,
        label: cleanLabel.length > 0 ? cleanLabel : undefined,
        titleLength: cleanTitle.length,
        paragraphs: paragraphDocs.length,
      },
      "Stored new report in reporting collections",
    );

    return NextResponse.json(
      {
        articleId,
        tabId: targetTabId,
        paragraphIds: paragraphDocs.map((doc) => doc._id),
      },
      { status: 201 },
    );
  } catch (error) {
    log.error({ event: "debate.failed", err: error }, "Failed to store new report");
    return NextResponse.json({ error: "Could not store report" }, { status: 500 });
  }
});
