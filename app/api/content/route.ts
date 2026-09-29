import { NextResponse } from "next/server";
import { getContentFromDb } from "@/lib/content-db";

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
export const GET = async (request: Request) => {
  const content = await getContentFromDb();
  return NextResponse.json(content);
};
