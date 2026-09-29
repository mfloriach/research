import { NextResponse } from "next/server";
import { incrementSourceOpenCount } from "@/app/server/repositories/sources";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Record a source open
 *
 * @description Increments the open count for a source item.
 * @tag Sources
 * @path AuditItemPathParams
 * @response SourceOpenResponse:Open count incremented
 * @response 404:ErrorResponse:Source not found
 * @response 500:ErrorResponse:Update failed
 * @openapi
 */
export const POST = async (request: Request, { params }: Props) => {
  const { id: sourceId } = await params;

  const openCount = await incrementSourceOpenCount(sourceId);

  return NextResponse.json({ sourceId, openCount });
};
