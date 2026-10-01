import { NextResponse } from "next/server";
import { createInterpretation } from "@/app/server/repositories/interpretations";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { parseJson } from "@/lib/parse_json";

/**
 * Create an interpretation audit item
 *
 * @description Validates the audit item payload, pins it to IPFS, splits
 * the markdown body into paragraphs, and stores it under the Interpretation tab.
 * @tag Interpretations
 * @requestBody AuditItemInput required
 * @response 201:AuditItemResponse:Interpretation created
 * @response 400:ErrorResponse:Invalid input
 * @response 500:ErrorResponse:Storage failed
 * @openapi
 */
export const POST = async (request: Request) => {
  const data = await parseJson(request, auditItemSchema);
  const paragraphs = splitAuditParagraphs(data.content);

  const { itemId, ipfsCid } = await createInterpretation({
    ...data,
    paragraphs,
  });

  return NextResponse.json({ itemId, ipfsCid }, { status: 201 });
};
