import { NextResponse } from "next/server";
import { auditItemSchema, splitAuditParagraphs } from "./schemas";
import { createFallacy } from "@/app/server/repositories/fallacies";
import { parseJson } from "@/lib/parse_json";
import { IpfsUnavailableError } from "@/lib/ipfs";

/**
 * Create a fallacy audit item
 *
 * @description Validates the audit item payload, pins it to IPFS, splits
 * the markdown body into paragraphs, and stores it under the Fallacies tab.
 * @tag Fallacies
 * @requestBody AuditItemInput required
 * @response 201:AuditItemResponse:Fallacy created
 * @response 400:ErrorResponse:Invalid input
 * @response 500:ErrorResponse:Storage failed
 * @openapi
 */
export const POST = async (request: Request) => {
  const data = await parseJson(request, auditItemSchema);

  const paragraphs = splitAuditParagraphs(data.content);

  try {
    const { itemId, tabId, ipfsCid } = await createFallacy({
      ...data,
      paragraphs,
    });

    return NextResponse.json({ itemId, tabId, ipfsCid }, { status: 201 });
  } catch (error) {
    if (error instanceof IpfsUnavailableError) {
      return NextResponse.json({ error: "IPFS unavailable" }, { status: 500 });
    }
    throw error;
  }
};
