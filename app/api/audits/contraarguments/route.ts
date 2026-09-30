import { NextResponse } from "next/server";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { createContraargument } from "@/app/server/repositories/contraarguments";
import { parseJson } from "@/lib/parse_json";

/**
 * Create a contraargument audit item
 *
 * @description Validates the audit item payload, pins it to IPFS, splits
 * the markdown body into paragraphs, and stores it under the Contraargument tab.
 * @tag Contraarguments
 * @requestBody AuditItemInput required
 * @response 201:AuditItemResponse:Contraargument created
 * @response 400:ErrorResponse:Invalid input
 * @response 500:ErrorResponse:Storage failed
 * @openapi
 */
export const POST = async (request: Request) => {
  const data = await parseJson(request, auditItemSchema);
  const paragraphs = splitAuditParagraphs(data.content);

  const { itemId, tabId, ipfsCid } = await createContraargument({
    ...data,
    paragraphs,
  });

  return NextResponse.json({ itemId, tabId, ipfsCid }, { status: 201 });
};
