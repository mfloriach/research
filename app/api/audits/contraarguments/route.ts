import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { createContraargument } from "@/app/server/repositories/contraarguments";
import { parseJson } from "@/lib/parse_json";

export const POST = withRouteLogging(
  `api/audits/contraarguments`,
  async (request, { params }, log) => {
    const data = await parseJson(request, auditItemSchema);
    const paragraphs = splitAuditParagraphs(data.content);

    const { itemId, tabId } = await createContraargument({
      ...data,
      paragraphs,
    });

    return NextResponse.json({ itemId, tabId }, { status: 201 });
  },
);
