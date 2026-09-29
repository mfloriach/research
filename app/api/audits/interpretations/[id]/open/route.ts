import { NextResponse } from "next/server";
import { incrementInterpretationOpenCount } from "@/app/server/repositories/interpretations";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Record an interpretation open
 *
 * @description Increments the open count for an interpretation item.
 * @tag Interpretations
 * @path AuditItemPathParams
 * @response InterpretationOpenResponse:Open count incremented
 * @response 404:ErrorResponse:Interpretation not found
 * @response 500:ErrorResponse:Update failed
 * @openapi
 */
export const POST = async (request: Request, { params }: Props) => {
  const { id: interpretationId } = await params;

  const openCount = await incrementInterpretationOpenCount(interpretationId);

  return NextResponse.json({ interpretationId, openCount });
};
