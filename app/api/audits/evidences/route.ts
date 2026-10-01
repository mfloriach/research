import { NextResponse } from "next/server";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { createEvidence } from "@/app/server/repositories/evidences";
import { parseJson } from "@/lib/parse_json";

/**
 * Create an evidence audit item
 *
 * @description Validates the audit item payload, pins it to IPFS, splits
 * the markdown body into paragraphs, and stores it under the Evidences tab.
 * @tag Evidences
 * @requestBody AuditItemInput required
 * @response 201:AuditItemResponse:Evidence created
 * @response 400:ErrorResponse:Invalid input
 * @response 500:ErrorResponse:Storage failed
 * @openapi
 */
export const POST = async (request: Request) => {
  const data = await parseJson(request, auditItemSchema);

  const paragraphs = splitAuditParagraphs(data.content);

  const { itemId, ipfsCid } = await createEvidence({
    ...data,
    paragraphs,
  });

  return NextResponse.json({ itemId, ipfsCid }, { status: 201 });
};
