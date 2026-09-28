import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import {
  AuditItemNotFoundError,
  incrementEvidenceOpenCount,
} from "@/app/server/repositories/evidences";


export const POST = withRouteLogging(
  "api/audits/evidences/open",
  async (request, { params },log) => {
    const { id: evidenceId } = await params;

    const openCount = await incrementEvidenceOpenCount(evidenceId);
    
    return NextResponse.json({ evidenceId, openCount });
  },
);
