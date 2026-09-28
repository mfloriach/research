import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import {
  AuditItemNotFoundError,
  incrementEvidenceOpenCount,
} from "@/app/server/repositories/evidences";

function itemIdFromPath(pathname: string): string {
  const segments = pathname.split("/").filter((segment) => segment.length > 0);
  if (segments.length >= 2 && segments[segments.length - 1] === "open") {
    return segments[segments.length - 2];
  }
  return "";
}

export const POST = withRouteLogging(
  "api/audits/evidences/open",
  async (request, log) => {
    const itemId = itemIdFromPath(new URL(request.url).pathname);
    if (!itemId) {
      return NextResponse.json({ error: "Missing audit item id" }, { status: 400 });
    }

    try {
      const openCount = await incrementEvidenceOpenCount(itemId);
      log.info(
        { event: "audit.opened", itemId, openCount },
        "Recorded evidence open",
      );
      return NextResponse.json({ itemId, openCount });
    } catch (error) {
      if (error instanceof AuditItemNotFoundError) {
        return NextResponse.json({ error: "Audit item not found" }, { status: 404 });
      }
      log.error(
        { event: "audit.openFailed", err: error },
        "Failed to record evidence open",
      );
      return NextResponse.json({ error: "Could not record open" }, { status: 500 });
    }
  },
);
