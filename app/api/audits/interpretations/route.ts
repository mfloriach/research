import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import { createInterpretation } from "@/app/server/repositories/interpretations";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { parseJson } from "@/lib/parse_json";

export const POST = withRouteLogging(
  `api/audits/interpretations`,
  async (request, { params }, log) => {
    const data = await parseJson(request, auditItemSchema);
    const paragraphs = splitAuditParagraphs(data.content);

    const { itemId, tabId } = await createInterpretation({
      ...data,
      paragraphs,
    });

    return NextResponse.json({ itemId, tabId }, { status: 201 });
  },
);
