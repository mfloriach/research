import { NextResponse } from "next/server";
import { getContentFromDb } from "@/lib/content-db";

/**
 * Get the full page content
 *
 * @description Reads the site, heading, reporting and audit content from
 * MongoDB and returns it reassembled for the page. When `id` is provided,
 * only that argument's content is returned.
 * @tag Content
 * @query id string - Argument id to scope the content to
 * @response ContentResponse:Full page content
 * @response 500:ErrorResponse:Content unavailable
 * @openapi
 */
export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? undefined;
  const content = await getContentFromDb(id);
  return NextResponse.json(content);
};
