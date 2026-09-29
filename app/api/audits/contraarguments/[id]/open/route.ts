import { NextResponse } from "next/server";
import { incrementContraargumentOpenCount } from "@/app/server/repositories/contraarguments";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Record a contraargument open
 *
 * @description Increments the open count for a contraargument item.
 * @tag Contraarguments
 * @path AuditItemPathParams
 * @response ContraargumentOpenResponse:Open count incremented
 * @response 404:ErrorResponse:Contraargument not found
 * @response 500:ErrorResponse:Update failed
 * @openapi
 */
export const POST = async (request: Request, { params }: Props) => {
  const { id: contraargumentId } = await params;

  const openCount = await incrementContraargumentOpenCount(contraargumentId);

  return NextResponse.json({ contraargumentId, openCount });
};
