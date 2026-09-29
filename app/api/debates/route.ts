import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Int32 } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/db/migration";
import { debateInputSchema, splitMarkdownParagraphs } from "@/lib/api-schemas";

type ReportingTabDoc = { _id: string; label: string; order?: number };

/**
 * Create a debate report
 *
 * @description Stores a new report as an article with paragraphs, reusing or
 * creating the target reporting tab.
 * @tag Debates
 * @requestBody DebateInput required
 * @response 201:DebateResponse:Report stored
 * @response 400:ErrorResponse:Invalid input
 * @response 500:ErrorResponse:Storage failed
 * @openapi
 */
export const POST = async (request: Request) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = debateInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 },
    );
  }

  const {
    title: cleanTitle,
    description: cleanDescription,
    tabId: rawTabId,
    label: rawLabel,
  } = parsed.data;
  const cleanLabel = rawLabel ?? "";

  const chunks = splitMarkdownParagraphs(cleanDescription);
  if (chunks.length === 0) {
    return NextResponse.json(
      { error: "Description must not be empty" },
      { status: 400 },
    );
  }

  const db = await getDb();

  let targetTabId =
    typeof rawTabId === "string" && rawTabId.length > 0 ? rawTabId : null;
  if (targetTabId) {
    const tab = await db
      .collection<ReportingTabDoc>(COLLECTIONS.reportingTabs)
      .findOne({ _id: targetTabId }, { projection: { _id: 1 } });
    if (!tab) {
      return NextResponse.json(
        { error: "Unknown reporting tab" },
        { status: 400 },
      );
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
        .collection<{
          _id: string;
          label: string;
          order: Int32;
        }>(COLLECTIONS.reportingTabs)
        .insertOne({
          _id: targetTabId,
          label: cleanLabel,
          order: new Int32(nextOrder),
        });
    }
  } else {
    const firstTab = await db
      .collection<ReportingTabDoc>(COLLECTIONS.reportingTabs)
      .find({})
      .sort({ order: 1 })
      .limit(1)
      .toArray();
    if (firstTab.length === 0) {
      return NextResponse.json(
        { error: "No reporting tabs available" },
        { status: 500 },
      );
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

  return NextResponse.json(
    {
      articleId,
      tabId: targetTabId,
      paragraphIds: paragraphDocs.map((doc) => doc._id),
    },
    { status: 201 },
  );
};
