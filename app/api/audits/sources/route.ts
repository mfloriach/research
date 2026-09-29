import { NextResponse } from "next/server";
import { createSource } from "@/app/server/repositories/sources";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { parseJson } from "@/lib/parse_json";

/**
 * Create a source audit item
 *
 * @description Validates the audit item payload, splits the markdown body
 * into paragraphs, and stores it under the Sources tab.
 * @tag Sources
 * @requestBody AuditItemInput required
 * @response 201:AuditItemResponse:Source created
 * @response 400:ErrorResponse:Invalid input
 * @response 500:ErrorResponse:Storage failed
 * @openapi
 */
export const POST = async (request: Request) => {
  const data = await parseJson(request, auditItemSchema);
  const paragraphs = splitAuditParagraphs(data.content);

  const { itemId, tabId } = await createSource({
    ...data,
    paragraphs,
  });

  return NextResponse.json({ itemId, tabId }, { status: 201 });
};
