import { NextResponse } from "next/server";
import { createInterpretation } from "@/app/server/repositories/interpretations";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { parseJson } from "@/lib/parse_json";

export const POST = async (request: Request) => {
  const data = await parseJson(request, auditItemSchema);
  const paragraphs = splitAuditParagraphs(data.content);

  const { itemId, tabId } = await createInterpretation({
    ...data,
    paragraphs,
  });

  return NextResponse.json({ itemId, tabId }, { status: 201 });
};
