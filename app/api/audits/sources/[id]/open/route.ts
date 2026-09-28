import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import {
  AuditItemNotFoundError,
  incrementSourceOpenCount,
} from "@/app/server/repositories/sources";

export const POST = withRouteLogging(
  "api/audits/sources/open",
  async (request, { params },log) => {

    const { id: sourceId } = await params;

    const openCount = await incrementSourceOpenCount(sourceId);
    
    return NextResponse.json({ sourceId, openCount });
  },
);
