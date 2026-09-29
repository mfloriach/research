import { NextResponse } from "next/server";
import { incrementFallacyOpenCount } from "@/app/server/repositories/fallacies";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Record a fallacy open
 *
 * @description Increments the open count for a fallacy item.
 * @tag Fallacies
 * @path AuditItemPathParams
 * @response FallacyOpenResponse:Open count incremented
 * @response 404:ErrorResponse:Fallacy not found
 * @response 500:ErrorResponse:Update failed
 * @openapi
 */
export const POST = async (request: Request, { params }: Props) => {
  const { id: fallacyId } = await params;

  const openCount = await incrementFallacyOpenCount(fallacyId);

  return NextResponse.json({ fallacyId, openCount });
};
