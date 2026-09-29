import { NextResponse } from "next/server";
import { incrementEvidenceOpenCount } from "@/app/server/repositories/evidences";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Record an evidence open
 *
 * @description Increments the open count for an evidence item.
 * @tag Evidences
 * @path AuditItemPathParams
 * @response EvidenceOpenResponse:Open count incremented
 * @response 404:ErrorResponse:Evidence not found
 * @response 500:ErrorResponse:Update failed
 * @openapi
 */
export const POST = async (request: Request, { params }: Props) => {
  const { id: evidenceId } = await params;

  const openCount = await incrementEvidenceOpenCount(evidenceId);

  return NextResponse.json({ evidenceId, openCount });
};
