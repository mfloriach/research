import { NextResponse } from "next/server";
import { getContentFromDb } from "@/lib/content-db";
import { withRouteLogging } from "@/lib/api-log";

export const GET = withRouteLogging("api/content", async (_request, log) => {
  try {
    const content = await getContentFromDb();
    return NextResponse.json(content);
  } catch (error) {
    log.error(
      { event: "content.failed", err: error },
      "Failed to read content from MongoDB",
    );
    return NextResponse.json({ error: "Content unavailable" }, { status: 500 });
  }
});
