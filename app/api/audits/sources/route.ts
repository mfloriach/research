import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import { createSource } from "@/app/server/repositories/sources";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { parseJson } from "@/lib/parse_json";

export const POST = withRouteLogging(
  `api/audits/sources`,
  async (request, { params }, log) => {
    const data = await parseJson(request, auditItemSchema);
    const paragraphs = splitAuditParagraphs(data.content);

    const { itemId, tabId } = await createSource({
      ...data,
      paragraphs,
    });

    return NextResponse.json({ itemId, tabId }, { status: 201 });
  },
);
