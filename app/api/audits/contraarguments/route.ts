import { NextResponse } from "next/server";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { createContraargument } from "@/app/server/repositories/contraarguments";
import { parseJson } from "@/lib/parse_json";

export const POST = async (request: Request) => {
  const data = await parseJson(request, auditItemSchema);
  const paragraphs = splitAuditParagraphs(data.content);

  const { itemId, tabId } = await createContraargument({
    ...data,
    paragraphs,
  });

  return NextResponse.json({ itemId, tabId }, { status: 201 });
};
