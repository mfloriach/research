import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { createEvidence } from "@/app/server/repositories/evidences";
import { parseJson } from "@/lib/parse_json";

export const POST = withRouteLogging(
  `api/audits/evidences`,
  async (request, { params }, log) => {
    const data = await parseJson(request, auditItemSchema);

    const paragraphs = splitAuditParagraphs(data.content);

    const { itemId, tabId } = await createEvidence({
      ...data,
      paragraphs,
    });

    return NextResponse.json({ itemId, tabId }, { status: 201 });
  },
);
