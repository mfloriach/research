import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import {
  AuditItemNotFoundError,
  incrementInterpretationOpenCount,
} from "@/app/server/repositories/interpretations";

export const POST = withRouteLogging(
  "api/audits/interpretations/open",
  async (request, { params },log) => {
    const { id: interpretationId } = await params;

    const openCount = await incrementInterpretationOpenCount(interpretationId);
    
    return NextResponse.json({ interpretationId, openCount });
  },
);
