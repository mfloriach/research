import { NextResponse } from "next/server";
import { withRouteLogging } from "@/lib/api-log";
import {
  AuditItemNotFoundError,
  incrementInterpretationOpenCount,
} from "@/app/server/repositories/interpretations";

function itemIdFromPath(pathname: string): string {
  const segments = pathname.split("/").filter((segment) => segment.length > 0);
  if (segments.length >= 2 && segments[segments.length - 1] === "open") {
    return segments[segments.length - 2];
  }
  return "";
}

export const POST = withRouteLogging(
  "api/audits/interpretations/open",
  async (request, log) => {
    const itemId = itemIdFromPath(new URL(request.url).pathname);
    if (!itemId) {
      return NextResponse.json({ error: "Missing audit item id" }, { status: 400 });
    }

    try {
      const openCount = await incrementInterpretationOpenCount(itemId);
      log.info(
        { event: "audit.opened", itemId, openCount },
        "Recorded interpretation open",
      );
      return NextResponse.json({ itemId, openCount });
    } catch (error) {
      if (error instanceof AuditItemNotFoundError) {
        return NextResponse.json({ error: "Audit item not found" }, { status: 404 });
      }
      log.error(
        { event: "audit.openFailed", err: error },
        "Failed to record interpretation open",
      );
      return NextResponse.json({ error: "Could not record open" }, { status: 500 });
    }
  },
);
