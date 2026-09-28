import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import {
  AuditTabNotFoundError,
  UnknownParagraphsError,
  createInterpretation,
} from "@/app/server/repositories/interpretations";
import {auditItemSchema, splitAuditParagraphs} from "./schemas"



export const POST = withRouteLogging(`api/audits/interpretations`, async (request, log) => {
    let raw: Record<string, unknown>;
    try {
      raw = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = auditItemSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
        { status: 400 },
      );
    }

    const {
      title: cleanTitle,
      content: cleanContent,
      author: cleanAuthor,
      date: cleanDate,
      paragraphIds,
    } = parsed.data;

    const paragraphs = splitAuditParagraphs(cleanContent);

    try {
      const { itemId, tabId } = await createInterpretation({
        title: cleanTitle,
        paragraphs,
        paragraphIds,
        author: cleanAuthor,
        date: cleanDate
      });

      return NextResponse.json({ itemId, tabId }, { status: 201 });
    } catch (error) {
      if (error instanceof UnknownParagraphsError) {
        return NextResponse.json(
          { error: "One or more related paragraphs do not exist" },
          { status: 400 },
        );
      }
      if (error instanceof AuditTabNotFoundError) {
        return NextResponse.json(
          { error: `No Interpretation audit tab available` },
          { status: 500 },
        );
      }
      log.error(
        { event: "audit.failed", kind: "interpretations", err: error },
        `Failed to store new interpretations`,
      );
      return NextResponse.json({ error: "Could not store audit item" }, { status: 500 });
    }
  });