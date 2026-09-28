import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import {
  AuditItemNotFoundError,
  incrementContraargumentOpenCount,
} from "@/app/server/repositories/contraarguments";


export const POST = withRouteLogging(
  "api/audits/contraarguments/open",
  async (request, { params }, log) => {
    const { id: contraargumentId } = await params;

    const openCount = await incrementContraargumentOpenCount(contraargumentId);
    
    return NextResponse.json({ contraargumentId, openCount });
  },
);
