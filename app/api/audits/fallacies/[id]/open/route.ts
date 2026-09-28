import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import {
  incrementFallacyOpenCount,
} from "@/app/server/repositories/fallacies";


export const POST = withRouteLogging(
  "api/audits/fallacies/open",
  async (request, { params },log) => {
    const { id: fallacyId } = await params;

    const openCount = await incrementFallacyOpenCount(fallacyId);
    
    return NextResponse.json({ fallacyId, openCount });
  },
);
