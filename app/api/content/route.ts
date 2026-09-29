import { NextResponse } from "next/server";
import { getContentFromDb } from "@/lib/content-db";
import { withRouteLogging } from "@/lib/api-log";

/**
 * Get the full page content
 *
 * @description Reads the site, heading, reporting and audit content from
 * MongoDB and returns it reassembled for the page.
 * @tag Content
 * @response ContentResponse:Full page content
 * @response 500:ErrorResponse:Content unavailable
 * @openapi
 */
export const GET = withRouteLogging(
  "api/content",
  async (_request, _context, log) => {
    try {
      const content = await getContentFromDb();
      return NextResponse.json(content);
    } catch (error) {
      log.error(
        { event: "content.failed", err: error },
        "Failed to read content from MongoDB",
      );
      return NextResponse.json(
        { error: "Content unavailable" },
        { status: 500 },
      );
    }
  },
);
